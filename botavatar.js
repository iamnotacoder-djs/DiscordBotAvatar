const   { Client, Collection, IntentsBitField, Partials } = require("discord.js"), // ^14.1.2
        client = new Client({
            intents: [ IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildEmojisAndStickers, IntentsBitField.Flags.DirectMessages, IntentsBitField.Flags.DirectMessageTyping, IntentsBitField.Flags.GuildMessageTyping ],
            partials: [ Partials.Channel, Partials.Message ]
        }),
		{ QuickDB } = require("quick.db"), // ^9.0.6
        Logger = require("./structures/Logger"),
        ConfigUtil = require("./structures/ConfigUtil");
require('dotenv').config()
global.Config = new ConfigUtil();
global.Log = new Logger();
client.login(process.env.TOKEN)
    .then(async () => {
        await Log.init(client);
        Log.send(`[INDEX] Инициализация бота`);
        client.db = new QuickDB();
        client.commands = new Collection();

        // Хандлеры
        require(`./imports/handler_events.js`).init(client).catch(Log.error);
        require(`./imports/handler_commands.js`).init(client).catch(Log.error);
    });

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
client.on('error', Log.error);
client.on('warn', Log.error);

module.exports = client;