'use strict';
const   BaseCommand = require('../structures/BaseCommand'),
        { ApplicationCommandType, ModalBuilder, TextInputBuilder, PermissionFlagsBits, TextInputStyle, ActionRowBuilder } = require('discord.js');

class EditMessageCTX extends BaseCommand {
    
    name = "Изменить сообщение";
    usage = "Изменить сообщение";
    type = [Config.CommandType.SLASH_APPLICATION, Config.CommandType.CTX_MESSAGE];
    slash = { 
        name: this.name, 
        type: ApplicationCommandType.Message,
		defaultMemberPermissions: PermissionFlagsBits.Administrator,
		dmPermission: false
    };
    componentsNames = [ 'edit_message' ];

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
		if (command.targetMessage.author.id != client.user.id) {
			return command.reply({
				ephemeral: true,
				content: `Можно редачить только сообщения ${client.user.id}.`,
				allowedMentions: { users: [] }
			});
		}
        client.db.set('editMessage', {
            message: command.targetMessage.id,
            channel: command.targetMessage.channel.id
        });
        command.showModal(
            new ModalBuilder()
                .setCustomId('edit_message')
                .setTitle('Редактировать сообщение')
                .setComponents([
                    new ActionRowBuilder()
                        .addComponents([
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel('Сообщение')
                                .setStyle(TextInputStyle.Paragraph)
                                .setMaxLength(1999)
                                .setMinLength(1)
                                .setValue(command.targetMessage?.content ?? '')
                                .setRequired(true)
                        ])
                ])
        );
    }

    componentListener(client, interaction) {
        if (interaction.customId == "edit_message") {
            let text = interaction.fields.getTextInputValue('text');
            client.db.get('editMessage')
                .then(async (db) => {
                    const channel = await client.channels.fetch(db.channel);
                    const message = await channel.messages.fetch(db.message);
                    message.edit({
                        content: text
                    });
                    interaction?.deferUpdate();
                })
                .catch((e) => {
                    interaction.reply({
                        ephemeral: true,
                        content: `[EditMessageCTX] Ошибка: \n${e}`,
                        allowedMentions: { users: [] }
                    });
                })
            return true;
        }
    }
}

module.exports = EditMessageCTX