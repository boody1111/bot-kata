const fs = require('fs-extra');
const path = require('path');

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

module.exports.config = {
    name: "راك",
    aliases: ["addadmin", "مدير"],
    version: "3.0.0",
    hasPermssion: 3,
    credits: "اربرت اليكسي",
    description: "يضيف أو يزيل أدمن بوت ويعرض قائمة الأدمنز",
    commandCategory: "المطور",
    usages: "راك ← قائمة الأدمنز | راك [ID/تاج] ← إضافة | راك ازالة [ID/تاج] ← إزالة",
    cooldowns: 0
};

async function getAdminList(api) {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const adminIDs = (config.ADMINBOT || []).filter(Boolean).map(String);

    let msg = `👑 قائمة أدمنز البوت (${adminIDs.length})\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;

    for (let i = 0; i < adminIDs.length; i++) {
        const id = adminIDs[i];
        let name = id;
        try {
            const info = await api.getUserInfo(id);
            name = info[id]?.name || id;
        } catch {}
        msg += `${i + 1}. ${name}\n🆔 ${id}\n`;
        if (i < adminIDs.length - 1) msg += `─────────────────────\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📌 إضافة: راك [ID]\n📌 إزالة: راك ازالة [ID]`;
    return msg;
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, mentions } = event;

    const isRemove = args[0] && ['ازالة', 'إزالة', 'remove', 'حذف'].includes(args[0]);

    // بدون args — عرض القائمة
    if (!isRemove && !args[0]) {
        try {
            const listMsg = await getAdminList(api);
            return api.sendMessage(listMsg, threadID, messageID);
        } catch (e) {
            return api.sendMessage('❌ فشل جلب القائمة: ' + e.message, threadID, messageID);
        }
    }

    let targetID = null;
    let targetName = '';

    if (isRemove) {
        if (args[1] && /^\d+$/.test(args[1])) {
            targetID = args[1];
        } else if (messageReply) {
            targetID = String(messageReply.senderID);
        } else if (Object.keys(mentions || {}).length > 0) {
            targetID = Object.keys(mentions)[0];
        }
        if (!targetID) {
            return api.sendMessage('⚠️ حدد الشخص: راك ازالة [ID] أو رد على رسالته', threadID, messageID);
        }
    } else {
        if (messageReply) {
            targetID = String(messageReply.senderID);
        } else if (Object.keys(mentions || {}).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (args[0] && /^\d+$/.test(args[0])) {
            targetID = args[0];
        }
        if (!targetID) {
            try {
                const listMsg = await getAdminList(api);
                return api.sendMessage(listMsg, threadID, messageID);
            } catch {
                return api.sendMessage('⚠️ حدد الشخص: راك [ID] أو رد على رسالته أو تاجه', threadID, messageID);
            }
        }
    }

    try {
        const info = await api.getUserInfo(targetID);
        targetName = info[targetID]?.name || targetID;
    } catch { targetName = targetID; }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    if (!Array.isArray(config.ADMINBOT)) config.ADMINBOT = [];
    if (!Array.isArray(global.config.ADMINBOT)) global.config.ADMINBOT = [];

    const adminList = config.ADMINBOT.map(String).filter(Boolean);

    if (isRemove) {
        if (!adminList.includes(String(targetID))) {
            return api.sendMessage(`⚠️ ${targetName} ليس أدمن بوت أصلاً!`, threadID, messageID);
        }

        config.ADMINBOT = config.ADMINBOT.filter(id => String(id) !== String(targetID));
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), 'utf8');
        global.config.ADMINBOT = global.config.ADMINBOT.filter(id => String(id) !== String(targetID));

        let msg = `🗑️ تم سحب الصلاحيات!\n\n👤 ${targetName}\n🆔 ${targetID}\n\n`;
        // عرض القائمة بعد الإزالة
        try {
            const remaining = config.ADMINBOT.filter(Boolean).map(String);
            msg += `📋 أدمنز البوت الآن (${remaining.length}):\n`;
            for (let i = 0; i < remaining.length; i++) {
                let nm = remaining[i];
                try { const inf = await api.getUserInfo(remaining[i]); nm = inf[remaining[i]]?.name || remaining[i]; } catch {}
                msg += `${i + 1}. ${nm} — ${remaining[i]}\n`;
            }
        } catch {}

        return api.sendMessage(msg, threadID, messageID);
    }

    // إضافة
    if (adminList.includes(String(targetID))) {
        return api.sendMessage(`✅ ${targetName} هو مسبقاً أدمن بوت!`, threadID, messageID);
    }

    config.ADMINBOT.push(String(targetID));
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), 'utf8');
    global.config.ADMINBOT.push(String(targetID));

    let msg = `👑 تم رفع الصلاحيات!\n\n🔱 ${targetName}\n🆔 ${targetID}\n✅ أدمن بوت الآن\n\n`;
    // عرض القائمة بعد الإضافة
    try {
        const updated = config.ADMINBOT.filter(Boolean).map(String);
        msg += `📋 أدمنز البوت الآن (${updated.length}):\n`;
        for (let i = 0; i < updated.length; i++) {
            let nm = updated[i];
            try { const inf = await api.getUserInfo(updated[i]); nm = inf[updated[i]]?.name || updated[i]; } catch {}
            msg += `${i + 1}. ${nm} — ${updated[i]}\n`;
        }
    } catch {}

    api.sendMessage(msg, threadID, messageID);
};
