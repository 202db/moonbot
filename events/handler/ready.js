const { ActivityType, Events } = require("discord.js");
const loadSlashCommands = require("../../handlers/slashcommand");

module.exports = {
  name: "ready",
  async execute(bot) {
    await loadSlashCommands(bot);
    console.log(`Connectés à ${bot.user.username}`);
    console.log(`Le bot est utilisé sur ${bot.guilds.cache.size} serveur(s) !`);

    bot.user.setPresence({
      activities: [
        {
          name: "Join Moon services",
          type: ActivityType.Streaming,
          url: "https://discord.gg/WzQGA8A5",
        },
      ],
      status: "dnd",
    });
  },
};