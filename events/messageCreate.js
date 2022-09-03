const { ChannelType } = require("discord.js");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        await Log.init(client);
        // Чтение сообщений из ДМ
        if (message.channel.type == ChannelType.DM && message.author.id != client.user.id) {
            let db = await client.db.get(message.author.id), channel;
            async function createThreadChannel(client, messageAuthor) {
                let channel = await client.channels.fetch(Config.controller_dm).catch(Log.error);
                if (channel != undefined) {
                    let m = await channel.send({
                        content: `${messageAuthor.tag} - <@${messageAuthor.id}> (${messageAuthor.id})`
                    }).catch(console.log);
                    channel = await m.startThread({
                        name: `${messageAuthor.tag} - <@${messageAuthor.id}> (${messageAuthor.id})`.substring(0, 24)
                    });
                    client.db.set(messageAuthor.id, channel.id);
                }
                return channel;
            }
            if (db == null) {
                channel = await createThreadChannel(client, message.author);
            } else {
                channel = await client.channels.fetch(db).catch(Log.error);
                if (channel == undefined) channel = await createThreadChannel(client, message.author);
            }
            if (channel != undefined) {
                if (channel.archived) {
                    await channel.setArchived(false);
                }
                let reply = { content: '@everyone ' };
                if (channel?.lastMessage && (Date.now() - channel.lastMessage.createdTimestamp < 1000 * 60 * 60)) reply.content = '';
                if (message.content.length > 0) {
                    reply.content += message.content.substring(0, 1999);
                }
                if (message.embeds.length > 0) {
                    reply.embeds = message.embeds;
                }
                if (message.attachments.size > 0) {
                    reply.files = [];
                    message.attachments.forEach((m) => reply.files.push(m));
                }
                if (message.stickers.size > 0) {
                    message.stickers.forEach((m) => reply.content += `[Стикер: ${m?.name}]`);
                }
                channel.send(reply).catch(Log.error);
            }
        }
        // Чтение сообщений Треда
        if (message.channel.type == ChannelType.GuildPublicThread && message.channel?.parentId == Config.controller_dm && !message.author.bot) {
            let starterMessage = await message.channel.fetchStarterMessage();
            let user = await client.users.fetch(starterMessage.content.match(/\(([^)]+)\)/)[1]).catch(() => {});
            let reply = {};
            if (message.content.length > 0) {
                reply.content = message.content.substring(0, 1999).replace(`<@${client.user.id}>`, '');
            }
            if (message.embeds.length > 0) {
                reply.embeds = message.embeds;
            }
            if (message.attachments.size > 0) {
                reply.files = [];
                message.attachments.forEach((m) => reply.files.push(m));
            }
            if (message.stickers.size > 0) {
                reply.stickers = [];
                message.stickers.forEach((m) => reply.stickers.push(m));
            }
            user.send(reply).catch((e) => {
                message.reply({
                    content: `Ошибка: ${e}`.substring(0, 1999)
                })
            });
        }
    }
}