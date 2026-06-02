module.exports.config = {
    name: "اضف",
    aliases: ["add-user", "azef"],
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Hitler System",
    description: "يضيف شخصاً للكروب عبر ID حسابه",
    commandCategory: "إدارة المجموعة",
    usages: "اضف [ID الحساب]",
    cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    let targetID = args[0] ? args[0].replace(/[^0-9]/g, '') : '';

    if (!targetID) {
        return api.sendMessage('⚠️ يرجى ذكر ID الشخص\nمثال: اضف 123456789', threadID, messageID);
    }

    try {
        await api.addUserToGroup(targetID, threadID);
        const userInfo = await api.getUserInfo(targetID);
        const userName = userInfo[targetID]?.name || targetID;
        return api.sendMessage(`✅ تم إضافة [ ${userName} ] للكروب بنجاح!`, threadID, messageID);
    } catch (e) {
        return api.sendMessage('❌ تعذّر الإضافة. تأكد من صحة الـ ID وأن البوت أدمن.', threadID, messageID);
    }
};
