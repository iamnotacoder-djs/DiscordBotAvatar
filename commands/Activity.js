'use strict';
const BaseCommand = require('../structures/BaseCommand'),
	{ ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits, ActivityType } = require('discord.js');

class Activity extends BaseCommand {

	name = "activity";
	usage = "Активность аккаунта";
	type = [ Config.CommandType.SLASH_APPLICATION ];
	slash = {
		name: this.name,
		description: this.usage,
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: "type",
				description: "Тип активности",
				type: ApplicationCommandOptionType.Integer,
				choices: [
					{
						name: 'Streaming',
						value: ActivityType.Streaming
					},
					{
						name: 'Listening',
						value: ActivityType.Listening
					},
					{
						name: 'Watching',
						value: ActivityType.Watching
					},
					{
						name: 'Playing',
						value: ActivityType.Playing
					}
				],
				required: true
			}, 
			{
				name: "title",
				description: "Текст статуса",
				type: ApplicationCommandOptionType.String,
				required: true
			}, 
			{
				name: "url",
				description: "URL на стрим Twitch",
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
		const 	type = command.options.getInteger("type"),
				title = command.options.getString("title"),
				url = command.options.getString("url");
		let activity = {
			name: title,
			type: type
		};
		if (url != undefined && url?.length != 0) {
			activity.url = url;
		}
		client.user.setPresence({ 
			activities: [ activity ], status: 'online' 
		});
		command.reply({
			ephemeral: true,
			content: 'Отправлено'
		})
	}
}

module.exports = Activity