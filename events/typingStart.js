const { ChannelType } = require("discord.js");

module.exports = {
    name: 'typingStart',
    once: false,
    async execute(client, typing) {
        await Log.init(client);
        // Чтение сообщений из ДМ
        if (typing.channel.type == ChannelType.DM && typing.user.id != client.user.id) {
            let db = await client.db.get(typing.user.id);
            if (db == null) {
                // do nothing
            } else {
                const channel = await client.channels.fetch(db).catch(Log.error);
                if (channel != undefined) {
                    channel.sendTyping().catch(Log.error);
                }
            }
        }
        // Чтение сообщений Треда
        if (typing.channel.type == ChannelType.GuildPublicThread && typing.channel?.parentId == Config.controller_dm && !typing.user.bot) {
            let starterMessage = await typing.channel.fetchStarterMessage();
            let user = await client.users.fetch(starterMessage.content.match(/\(([^)]+)\)/)[1]).catch(() => {});
            let channel = await user.createDM().catch(() => {});
            channel?.sendTyping()?.catch(Log.error);
        }
    }
}