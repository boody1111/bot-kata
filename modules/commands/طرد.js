module.exports.config = {
    name: "طرد",
    aliases: ["kick-user", "tard"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يطرد شخصاً من الكروب عند الرد عليه أو تاجه",
    commandCategory: "إدارة المجموعة",
    usages: "طرد (رد على رسالة) أو طرد @شخص",
    cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    let targetID = null;

    if (messageReply && messageReply.senderID) {
        targetID = String(messageReply.senderID);
    } else if (mentions && Object.keys(mentions).length > 0) {
        targetID = String(Object.keys(mentions)[0]);
    }

    if (!targetID) {
        return api.sendMessage('⚠️ رد على رسالة الشخص أو قم بتاجه\nمثال: طرد @شخص', threadID, messageID);
    }

    const botID = String(api.getCurrentUserID());
    const adminList = (global.config.ADMINBOT || []).map(String);

    if (targetID === botID) {
        return api.sendMessage('❌ لا يمكن طرد البوت!', threadID, messageID);
    }
    if (adminList.includes(targetID)) {
        return api.sendMessage('❌ لا يمكن طرد الأدمن!', threadID, messageID);
    }

    try {
        const userInfo = await api.getUserInfo(targetID);
        const userName = userInfo[targetID]?.name || 'المستخدم';
        await api.removeUserFromGroup(targetID, threadID);
        return api.sendMessage(`✅ تم طرد [ ${userName} ] من الكروب`, threadID, messageID);
    } catch (e) {
        return api.sendMessage('❌ تعذّر الطرد. تأكد أن البوت أدمن في الكروب.', threadID, messageID);
    }
};
