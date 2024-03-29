require('dotenv').config();
const { GClient, Plugins, Command, Component } = require('gcommands');
const { GatewayIntentBits } = require('discord.js');
const { join } = require('path');

// Set the default cooldown for commands
Command.setDefaults({
	cooldown: '20s',
});

// Set the default onError function for components
Component.setDefaults({
	onError: (ctx, error) => {
		return ctx.reply('Oops! Something went wrong')
	} 
});


// Search for plugins in node_modules (folder names starting with gcommands-plugin-) or plugins folder
Plugins.search(__dirname);

const client = new GClient({
	// Register the directories where your commands/components/listeners will be located.
	dirs: [
		join(__dirname, 'commands'),
		join(__dirname, 'components'),
		join(__dirname, 'listeners')
	],
	// Enable message support
	messageSupport: false,
	// Set the prefix for message commands
	// Set the guild where you will be developing your bot. This is usefull cause guild slash commands update instantly.
	devGuildId: process.env.DEV_SERVER,
	// Set the intents you will be using (https://discordjs.guide/popular-topics/intents.html#gateway-intents)
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Login to the discord API
client.login(process.env.TOKEN);