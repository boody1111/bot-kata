module.exports.config = {
    name: "مسؤل",
    aliases: ["masoul", "make-admin"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يرفع شخصاً أدمن في الكروب عبر ID حسابه",
    commandCategory: "إدارة المجموعة",
    usages: "مسؤل [ID الحساب]",
    cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    let targetID = args[0] ? args[0].replace(/[^0-9]/g, '') : '';

    if (!targetID) {
        return api.sendMessage('⚠️ يرجى ذكر ID الشخص\nمثال: مسؤل 123456789', threadID, messageID);
    }

    try {
        await api.addUserToAdminList(targetID, threadID);
        const userInfo = await api.getUserInfo(targetID);
        const userName = userInfo[targetID]?.name || targetID;
        return api.sendMessage(`👑 تم رفع [ ${userName} ] أدمن في الكروب بنجاح!`, threadID, messageID);
    } catch (e) {
        return api.sendMessage('❌ تعذّر الرفع. تأكد من صحة الـ ID وأن البوت أدمن في الكروب.', threadID, messageID);
    }
};
