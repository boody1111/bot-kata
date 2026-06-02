module.exports.config = {
    name: "احذف",
    aliases: ["del", "حذف"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "اربرت اليكسي",
    description: "يحذف رسالة البوت عند الرد عليها بهذا الأمر",
    commandCategory: "المطور",
    usages: "رد على رسالة البوت بـ: احذف",
    cooldowns: 0
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply) {
        return api.sendMessage('⚠️ ارد على رسالة البوت لحذفها', threadID, messageID);
    }

    const botID = api.getCurrentUserID();
    if (String(messageReply.senderID) !== String(botID)) {
        return api.sendMessage('❌ يمكن حذف رسائل البوت فقط!', threadID, messageID);
    }

    try {
        await api.unsendMessage(messageReply.messageID);
        setTimeout(() => {
            api.unsendMessage(messageID).catch(() => {});
        }, 500);
    } catch (e) {
        api.sendMessage('❌ فشل الحذف: ' + e.message, threadID, messageID);
    }
};
