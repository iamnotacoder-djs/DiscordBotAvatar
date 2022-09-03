'use strict';

class ConfigUtil {

	config = {};
	CommandType = { UNSET: 'unset', CHAT: 'chat', SLASH: 'slash', SLASH_APPLICATION: 'slash_application', CTX_USER: 'context_user', CTX_MESSAGE: 'context_message' , AUTOCOMPLETE: 'autocomplete' };

	capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	constructor() {
		this.config = require("../config.json");
		this.config.CommandType = this.CommandType;
		this.config.capitalize = this.capitalize;
		return this.config;
	}
}

module.exports = ConfigUtil;
