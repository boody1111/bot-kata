module.exports.config = {
    name: "ارفعني",
    aliases: ["arfani", "promote-me"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يرفع المطور أدمن في الكروب",
    commandCategory: "إدارة المجموعة",
    usages: "ارفعني",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
        await api.addUserToAdminList(senderID, threadID);
        return api.sendMessage('👑 تم رفعك أدمن في هذا الكروب بنجاح!', threadID, messageID);
    } catch (e) {
        return api.sendMessage('❌ تعذّر الرفع. تأكد أن البوت أدمن في الكروب.', threadID, messageID);
    }
};
