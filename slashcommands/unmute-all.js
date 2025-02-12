const Discord = require("discord.js")

module.exports = {
    name: 'unmute-all',
    description: 'Révoquer l\'ensemble des exclusions du serveur.',
    permission: "Aucune",
    dm: false,
    async run(bot, message, args) {
        bot.db.query(`SELECT * FROM bot WHERE guildId = "${message.guild.id}"`, async (err, req) => {
            const whitelist = JSON.parse(req[0].whitelist)
        
            if(message.user.id !== message.guild.ownerId && !whitelist.includes(message.user.id)) {
                const embedError = new Discord.EmbedBuilder()
                .setColor("Red")
                .setDescription(`**❌ Je n'ai pas la permission de retirer les exclusions.**`);
        
                return message.reply({ embeds: [embedError] });
            }
    
            const bans = await message.guild.members.cache.filter(member => member.communicationDisabledUntilTimestamp !== null);
            if(bans.size == 0) {
                const embedError = new Discord.EmbedBuilder()
                .setColor("Red")
                .setDescription(`**❌ Aucun membre n\'est actuellement muet sur le serveur.**`);
        
                return message.reply({ embeds: [embedError] });
            }
    
            const embed = new Discord.EmbedBuilder()
            .setColor("White")
            .setAuthor({ name: 'Révocation des exclusions', url: "https://discord.gg/WzQGA8A5", iconURL: bot.user.displayAvatarURL({ dynamic: true })})
            .setFooter({ iconURL: message.user.displayAvatarURL({ dynamic: true }), text: `Demandé par @${message.user.username}`})
            .setTimestamp()
            .setDescription(`Êtes vous sûr de vouloir révoquer l'exclusion de **${bans.size} membre${bans.size == 1 ? "" : "s"} ?**`)
    
            const bouton1 = new Discord.ButtonBuilder()
            .setLabel("Confirmer")
            .setCustomId("confirm")
            .setStyle(Discord.ButtonStyle.Success)
            const bouton2 = new Discord.ButtonBuilder()
            .setLabel("Annuler")
            .setCustomId("stop")
            .setStyle(Discord.ButtonStyle.Secondary)
    
            const row = new Discord.ActionRowBuilder().addComponents(bouton1, bouton2);   
    
            const msg = await message.reply({ embeds: [embed], components: [row], fetchReply: true })
            const collector = msg.createMessageComponentCollector({});
    
            collector.on("collect", async (interaction) => {
                const embed2 = new Discord.EmbedBuilder()
                .setColor('Red')
                .setDescription(`❌ Vous n'avez pas les permissions d'utiliser ce menu, ou alors le délai d'exécution de la commande est dépassé.`)
                if(interaction.user.id !== message.user.id) return interaction.reply({ embeds: [embed2], ephemeral: true })
                if(interaction.customId == "confirm") {
                    msg.components.forEach((row) => {
                        row.components.forEach((component) => {
                            component.data.disabled = true
                        })
                    })
                    await interaction.update({ components: msg.components })
    
                    const embed = new Discord.EmbedBuilder()
                    .setDescription(`**ℹ️ Révocation des exclusions en cours...**`)
                    .setColor("Blue")
                    await message.channel.send({ embeds: [embed]})
                    await bans.forEach(async (user) => {
                        await message.guild.bans.remove(user.user.id);
                    });
                    const embed2 = new Discord.EmbedBuilder()
                    .setDescription(`**✅ Révocation des exclusions effectuée avec succès.**`)
                    .setColor("Green")
                    await message.channel.send({ embeds: [embed2]})
    
                } else {
                    const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setDescription("**❌ Révocation des exclusions annulée.**")
                    msg.components.forEach((row) => {
                        row.components.forEach((component) => {
                            component.data.disabled = true
                        })
                    })
                    await interaction.update({ components: msg.components })
                    return message.channel.send({ embeds: [embed]})
                }
            })
    
        })
    }
}