const {SlashCommandBuilder} = require('discord.js');
const Database = require('better-sqlite3');
const db = new Database("whitelist.sqlite");



module.exports = {

    data : new SlashCommandBuilder()
        .setName('wl_add')
        .setDescription('Add an user to the whitelist')
        .addStringOption(option => option.setName('user').setDescription('The user to add to the whitelist').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('The id of the user').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('The date of the whitelist').setRequired(true)),


    async execute(interaction) {

        let user = interaction.options.getString('user');
        let id = interaction.options.getString('id');
        let date = interaction.options.getString('date');

        const check = db.prepare(`SELECT * FROM users WHERE discord_id = ${id}`);
        const resultCheck = check.get();
        
        if (resultCheck === undefined) {
            const query = db.prepare(`INSERT INTO users (name,discord_id,statut,created_at,updated_at) VALUES ('${user}','${id}','wl','${date}','${date}')`);
            const result = query.run();
            console.log(result);
            await interaction.reply({content: `The user ${user} has been added to the whitelist`});
        } else {
            await interaction.reply({content: `The user ${user} is already in the whitelist`});
        }
        
    }
};