'use strict';
const BaseCommand = require('../structures/BaseCommand'),
	{ ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

class SendMessage extends BaseCommand {

	name = "send";
	usage = "Отправка сообщения";
	type = [ Config.CommandType.SLASH_APPLICATION ];
	slash = {
		name: this.name,
		description: this.usage,
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: "message",
				description: "Текст сообщения",
				type: ApplicationCommandOptionType.String
			}, 
			{
				name: "reply",
				description: "Сообщение для реплая",
				type: ApplicationCommandOptionType.String
			}, 
			{
				name: "mention",
				description: "Пингануть",
				type: ApplicationCommandOptionType.Boolean
			}, 
			{
				name: "file",
				description: "Файлы",
				type: ApplicationCommandOptionType.Attachment
			}, 
			{
				name: "sticker",
				description: "Стикер",
				type: ApplicationCommandOptionType.String
			}
		],
		defaultMemberPermissions: PermissionFlagsBits.Administrator,
		dmPermission: false
	};
	componentsNames = [];

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
		command.deferReply({ ephemeral: true });
		const message = command.options.getString("message"),
				reply = command.options.getString("reply"),
				mention = command.options.getBoolean("mention") ?? true,
				file = command.options.getAttachment("file"),
				sticker = command.options.getString("sticker");
		let msgObject = {}, typing = 3000;
		if (message != undefined && message.length != 0) {
			msgObject.content = message;
			typing = Math.round((message.length * 1000 * 60) / (7 * 43));
		}
		if (reply != undefined && reply.length != 0) {
			msgObject.reply = {
				messageReference: reply,
				failIfNotExists: false
			};
		}
		if (mention == false) {
			msgObject.allowedMentions = {
				users: []
			};
		}
		if (file != undefined) {
			msgObject.files = [ file ];
		}
		if (sticker != undefined && command.inGuild()) {
			let stickerObject = command.guild.stickers.cache.find(st => st.name.toLowerCase().includes(sticker.toLowerCase()));
			if (stickerObject != undefined) {
				msgObject.stickers = [ stickerObject ];
			}
		}
		if (msgObject.files == undefined && msgObject.content == undefined && msgObject.stickers == undefined) {
			command.followUp({
				ephemeral: true,
				content: 'Нечего отправлять'
			});
		}
		if (msgObject.content != undefined) await command.channel.sendTyping();
		setTimeout(() => {
			command.channel.send(msgObject).catch(() => {});
			command.followUp({
				ephemeral: true,
				content: 'Отправлено'
			})
		}, typing);
	}
}

module.exports = SendMessage