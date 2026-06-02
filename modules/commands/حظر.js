module.exports.config = {
    name: "حظر",
    aliases: ["hazar", "ban-user"],
    version: "2.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يحظر شخصاً من استخدام البوت (الحظر دائم ويبقى بعد إعادة التشغيل)",
    commandCategory: "إدارة المجموعة",
    usages: "حظر (رد على رسالة) أو حظر @شخص",
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
        return api.sendMessage('⚠️ رد على رسالة الشخص أو قم بتاجه\nمثال: حظر @شخص', threadID, messageID);
    }

    const botID = String(api.getCurrentUserID());
    const adminList = (global.config.ADMINBOT || []).map(String);

    if (targetID === botID) {
        return api.sendMessage('❌ لا يمكن حظر البوت!', threadID, messageID);
    }
    if (adminList.includes(targetID)) {
        return api.sendMessage('❌ لا يمكن حظر الأدمن!', threadID, messageID);
    }
    if (global.data.userBanned.has(targetID)) {
        return api.sendMessage('⚠️ هذا المستخدم محظور مسبقاً', threadID, messageID);
    }

    try {
        const userInfo = await api.getUserInfo(targetID);
        const userName = userInfo[targetID]?.name || 'المستخدم';
        const reason = 'محظور من قبل الأدمن';
        const dateAdded = new Date().toLocaleString('ar');

        const userData = (await Users.getData(targetID)).data || {};
        userData.banned = 1;
        userData.reason = reason;
        userData.dateAdded = dateAdded;
        await Users.setData(targetID, { data: userData });

        global.data.userBanned.set(targetID, { reason, dateAdded });

        return api.sendMessage(`⛔ تم حظر [ ${userName} ] من استخدام البوت`, threadID, messageID);
    } catch (e) {
        return api.sendMessage('❌ حدث خطأ أثناء الحظر', threadID, messageID);
    }
};
