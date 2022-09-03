const { EmbedBuilder, InteractionType } = require("discord.js"),
	fs = require('fs'),
	componentsNames = [];

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(client, interaction) {
		await Log.init(client);

		if (interaction.isChatInputCommand() || interaction.isContextMenuCommand() || interaction?.type == InteractionType.ApplicationCommandAutocomplete) {
			const cmd = client.commands.get(interaction.commandName);
			try {
				if (cmd && interaction?.type == InteractionType.ApplicationCommandAutocomplete) {
					return cmd.autocomplete(client, interaction);
				}
				if (cmd && ((cmd.type.includes(Config.CommandType.SLASH) || cmd.type.includes(Config.CommandType.SLASH_APPLICATION)) && interaction.isChatInputCommand() || cmd.type.includes(Config.CommandType.CTX_USER) && interaction.isUserContextMenuCommand() || cmd.type.includes(Config.CommandType.CTX_MESSAGE) && interaction.isMessageContextMenuCommand())) {
					return cmd.exec(client, interaction);
				}
			} catch (err) {
				interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`Ошибка выполнения команды ${cmd.name}`)
							.setColor(Config.embed_color)
					],
					ephemeral: true
				});
				Log.send(`[EVENT/INTERACTIONCREATE] Ошибка выполнения команды ${cmd.name}: ${err}`);
			}
		} else {
			if (componentsNames.includes(interaction.customId) && fs.existsSync(`./components/${interaction.customId}.js`)) {
				return require(`../components/${interaction.customId}.js`)
					.init(client, interaction)
					.catch((e) => {
						Log.error(e);
						if (!interaction.replied) interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription(`Ошибка компонента ${interaction.customId}`)
									.setColor(Config.embed_color)
							],
							ephemeral: true
						});
						Log.send(`[EVENT/INTERACTIONCREATE] Ошибка компонента ${interaction.customId}: ${e}`);
					});
			}

			let found = false;
			client.commands.forEach((cmd) => {
				let regexName = false;
				cmd.componentsNames.forEach((name) => {
					if (name.includes('...') && interaction.customId.includes(name.replace('...', ''))) regexName = true;
				});
				if ((cmd.componentsNames.includes(interaction.customId) || regexName) && cmd.componentListener(client, interaction)) found = true;
			});

			if (!found) defer(interaction);
		}
	}
}

async function defer(interaction) {
	if (!interaction.replied) interaction?.deferUpdate();
}