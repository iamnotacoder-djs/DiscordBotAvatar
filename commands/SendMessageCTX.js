'use strict';
const   BaseCommand = require('../structures/BaseCommand'),
        { ApplicationCommandType, ModalBuilder, TextInputBuilder, PermissionFlagsBits, TextInputStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js');

class SendMessageCTX extends BaseCommand {
    
    name = "Написать сообщение";
    usage = "Написать сообщение";
    type = [Config.CommandType.SLASH_APPLICATION, Config.CommandType.CTX_MESSAGE];
    slash = { 
        name: this.name, 
        type: ApplicationCommandType.Message,
		defaultMemberPermissions: PermissionFlagsBits.Administrator,
		dmPermission: false
    };
    componentsNames = [ 'send_message' ];

    constructor() {
        super();
    }

    async execute(client, command) {
		if (!Config.bot_owners.includes(command.user.id)) {
			return command.reply({
				ephemeral: true,
				content: `Только ${Config.bot_owners.map((m) => `<@${m}>`)} имеют доступ к команде.`,
				allowedMentions: { users: [] }
			});
		}
        client.db.set('sendMessage', command.targetMessage.channel.id);
        command.showModal(
            new ModalBuilder()
                .setCustomId('send_message')
                .setTitle('Ответить на сообщение')
                .setComponents([
                    new ActionRowBuilder()
                        .addComponents([
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel('Сообщение')
                                .setStyle(TextInputStyle.Paragraph)
                                .setMaxLength(1999)
                                .setMinLength(1)
                                .setRequired(false)
                        ]),
                    new ActionRowBuilder()
                        .addComponents([
                            new TextInputBuilder()
                                .setCustomId('file')
                                .setLabel('Ссылка на файл')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setMinLength(3)
                        ]),
                    new ActionRowBuilder()
                        .addComponents([
                            new TextInputBuilder()
                                .setCustomId('sticker')
                                .setLabel('Название стикера')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                        ])
                ])
        );
    }

    componentListener(client, interaction) {
        if (interaction.customId == "send_message") {
            let text = interaction.fields.getTextInputValue('text'),
                url = interaction.fields.getTextInputValue('file'),
                sticker = interaction.fields.getTextInputValue('sticker');
            client.db.get('sendMessage')
                .then(async (db) => {
                    const channel = await client.channels.fetch(db);
                    let reply = {};
                    if (text.length > 0) {
                        reply.content = text;
                    }
                    if (url.length > 4) {
                        reply.files = [ new AttachmentBuilder(url) ];
                    }
                    if (sticker.length > 0 && interaction.inGuild()) {
                        let stickerObject = interaction.guild.stickers.cache.find(st => st.name.toLowerCase().includes(sticker.toLowerCase()));
                        if (stickerObject != undefined) {
                            reply.stickers = [ stickerObject ];
                        }
                    }
                    if (reply.content == undefined && reply.files == undefined && reply.stickers == undefined) {
                        interaction.reply({
                            ephemeral: true,
                            content: 'Нечего отправлять'
                        })
                    } else {
                        let typing = 3000;
                        if (reply.content != undefined) {
                            typing = Math.round((reply.content * 1000 * 60) / (7 * 43));
                            await interaction.channel.sendTyping();
                        }
                        setTimeout(() => {
                            channel.send(reply).catch(() => {});
                        }, typing);

                        interaction?.deferUpdate();
                    }
                })
                .catch((e) => {
                    interaction.reply({
                        ephemeral: true,
                        content: `[SendMessageCTX] Ошибка: \n${e}`,
                        allowedMentions: { users: [] }
                    });
                })
            return true;
        }
    }
}

module.exports = SendMessageCTX