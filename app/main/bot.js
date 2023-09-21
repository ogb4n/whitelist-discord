const fs = require("node:fs");
const path = require("node:path");
const Database = require('better-sqlite3');
const { Client, Collection, Events, GatewayIntentBits, Guild, GuildMember } = require("discord.js");

const db = new Database("whitelist.sqlite");
require("dotenv").config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });


// Commands Handler 
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, () => {
	//reload every commands at startup
	const { exec } = require('child_process');
	exec('node commands_deployment.js', (err, stdout, stderr) => {
		if (err) {
			// node couldn't execute the command
			return;
		}
		// the *entire* stdout and stderr (buffered)
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
	});
	console.log("bot is connected and Ready!");
});


client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		} else {
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	}
});

// whitelist appliance
client.on("guildMemberAdd", (member) => {
	// setting up query
	const query = db.prepare('SELECT * FROM users WHERE discord_id = ?');
	// on va cherche le résultat
	const result = query.get(member.user.id);
	console.log(result);
	// check si user est dans la db
	if (result === undefined) {
		// il y est pas, on le kick
		member.kick();
	} else {
		// il y est, on le welcome
		member.send(`Welcome to the server, ${member.displayName}!`);
	}
});

//bot init
console.log(process.env.TOKEN);
client.login(process.env.TOKEN);