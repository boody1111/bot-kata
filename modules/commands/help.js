module.exports.config = {
    name: "help",
    aliases: [],
    version: "1.0.0",
    hasPermssion: 0,
    credits: "system",
    description: "انظر: مساعدة",
    commandCategory: "نظام",
    usages: "مساعدة",
    cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
    const cmd = global.client.commands.get("مساعدة");
    if (cmd && cmd.run) return cmd.run({ api, event, args });
};
