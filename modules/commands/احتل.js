module.exports.config = {
    name: "احتل",
    aliases: ["ihtall", "occupy"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يزيل كل الأدمنز من الكروب ويبقي البوت فقط",
    commandCategory: "إدارة المجموعة",
    usages: "احتل",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
        const info = await api.getThreadInfo(threadID);
        const botID = String(api.getCurrentUserID());
        const adminList = (global.config.ADMINBOT || []).map(String);
        const admins = (info.adminIDs || []).map(a => String(a.id));

        await api.sendMessage('⚔️ الاحتلال بدأ! جاري إزالة الأدمنز...', threadID, messageID);

        let removed = 0;
        for (const adminID of admins) {
            if (adminID === botID) continue;
            if (adminList.includes(adminID)) continue;
            try {
                await api.removeUserFromAdminList(adminID, threadID);
                removed++;
                await new Promise(r => setTimeout(r, 500));
            } catch {}
        }

        return api.sendMessage(`👑 تم الاحتلال!\nتم إزالة ${removed} أدمن من الكروب\nالبوت أصبح الأدمن الوحيد!`, threadID, messageID);
    } catch (e) {
        return api.sendMessage('❌ تعذّر الاحتلال. تأكد أن البوت أدمن في الكروب.', threadID, messageID);
    }
};
