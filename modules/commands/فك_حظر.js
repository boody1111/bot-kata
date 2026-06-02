module.exports.config = {
    name: "فك_حظر",
    aliases: ["فك-حظر", "فك حظر", "unban-ar"],
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Hitler System",
    description: "يفك الحظر عن شخص (رد على رسالته أو تاجه)",
    commandCategory: "إدارة المجموعة",
    usages: "فك_حظر (رد على رسالة الشخص) أو فك_حظر @شخص",
    cooldowns: 3
};

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, messageReply, mentions } = event;

    let targetID = null;

    if (messageReply && messageReply.senderID) {
        targetID = String(messageReply.senderID);
    } else if (mentions && Object.keys(mentions).length > 0) {
        targetID = String(Object.keys(mentions)[0]);
    }

    if (!targetID) {
        return api.sendMessage('⚠️ رد على رسالة الشخص أو قم بتاجه\nمثال: فك_حظر @شخص', threadID, messageID);
    }

    if (!global.data.userBanned.has(targetID)) {
        return api.sendMessage('⚠️ هذا المستخدم غير محظور أصلاً', threadID, messageID);
    }

    try {
        const userInfo = await api.getUserInfo(targetID);
        const userName = userInfo[targetID]?.name || 'المستخدم';

        const userData = (await Users.getData(targetID)).data || {};
        userData.banned = 0;
        userData.reason = null;
        userData.dateAdded = null;
        await Users.setData(targetID, { data: userData });

        global.data.userBanned.delete(targetID);

        return api.sendMessage(`✅ تم فك الحظر عن [ ${userName} ] ويمكنه الآن استخدام البوت`, threadID, messageID);
    } catch (e) {
        return api.sendMessage('❌ حدث خطأ أثناء فك الحظر', threadID, messageID);
    }
};
