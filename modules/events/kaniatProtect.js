module.exports.config = {
    name: "kaniatProtect",
    eventType: ["log:user-nickname"],
    version: "1.0.0",
    credits: "Hitler System",
    description: "يحمي الكنيات من التغيير عندما يكون نظام كنيات مفعّلاً"
};

module.exports.run = async function ({ api, event }) {
    const { threadID, logMessageData, author } = event;

    if (!global.moduleData) return;
    if (!global.moduleData.kaniatNicks) return;
    if (!global.moduleData.kaniatNicks[threadID]) return;

    const savedNick = global.moduleData.kaniatNicks[threadID];
    const botID = api.getCurrentUserID();
    const changedUID = String(logMessageData && logMessageData.participant_id || '');
    const newNick = logMessageData && logMessageData.nickname;

    if (!changedUID || String(changedUID) === String(botID)) return;

    if (newNick !== savedNick) {
        try {
            await new Promise(r => setTimeout(r, 500));
            await api.changeNickname(savedNick, threadID, changedUID);
        } catch {}
    }
};
