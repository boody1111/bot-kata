const fs = require('fs-extra');
const path = require('path');

const HITLER_PATH = path.join(__dirname, 'cache', 'data', 'hitler.json');

function readHitler() {
    try {
        if (!fs.existsSync(HITLER_PATH)) return {};
        return JSON.parse(fs.readFileSync(HITLER_PATH, 'utf8'));
    } catch { return {}; }
}

function writeHitler(data) {
    try {
        fs.ensureDirSync(path.dirname(HITLER_PATH));
        fs.writeFileSync(HITLER_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch {}
}

const ADMIN_REPLY_MSG = `《🛞》  ⭒ ➠ ┇.𝐂𝐡𝐫𝐨𝐥𝐥𝐨 𝐋𝐮𝐜𝐢𝐥𝐟𝐞𝐫 𝐇𝐢𝐭𝐥𝐞𝐫
┋➣┋      《🥷🏻》

𝑪𝒉𝒓𝒐𝒍𝒍𝒐 𝑳𝒖𝒄𝒊𝒍𝒇𝒆𝒓 𝑯𝒊𝒕𝒍𝒆𝒓𝕾.㊑!

أدمن البوت يتحدث 👑`;

module.exports.config = {
    name: "ردادمن",
    aliases: ["admin-reply", "radmn"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يجعل البوت يرد تلقائياً على رسائل أدمن البوت فقط في الكروب",
    commandCategory: "النظام",
    usages: "ردادمن تشغيل | ردادمن إيقاف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.radmnActive) global.moduleData.radmnActive = {};

    const data = readHitler();
    if (!data.radmn) return;
    for (const threadID of Object.keys(data.radmn)) {
        global.moduleData.radmnActive[threadID] = true;
        console.log(`[ردادمن] تم استعادة الرد على الأدمن في: ${threadID}`);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.radmnActive) global.moduleData.radmnActive = {};

    const input = (args[0] || '').trim();

    if (input === 'تشغيل' || input === 'on') {
        global.moduleData.radmnActive[threadID] = true;
        const data = readHitler();
        if (!data.radmn) data.radmn = {};
        data.radmn[threadID] = true;
        writeHitler(data);
        return api.sendMessage('🟢 تم تفعيل الرد على الأدمن! سيرد البوت على كل رسالة من أدمن البوت\nللإيقاف: ردادمن إيقاف', threadID, messageID);
    }

    if (input === 'إيقاف' || input === 'ايقاف' || input === 'توقف' || input === 'off') {
        delete global.moduleData.radmnActive[threadID];
        const data = readHitler();
        if (data.radmn) delete data.radmn[threadID];
        writeHitler(data);
        return api.sendMessage('🔴 تم إيقاف الرد على الأدمن', threadID, messageID);
    }

    return api.sendMessage(
        '📖 طريقة الاستخدام:\nردادمن تشغيل ← يفعّل الرد على الأدمن\nردادمن إيقاف ← يوقف الرد',
        threadID, messageID
    );
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, messageID, body, type } = event;

    if (type !== 'message' && type !== 'message_reply') return;
    if (!body || !body.trim()) return;

    if (!global.moduleData || !global.moduleData.radmnActive) return;
    if (!global.moduleData.radmnActive[threadID]) return;

    const adminList = (global.config.ADMINBOT || []).map(String);
    if (!adminList.includes(String(senderID))) return;

    const botID = String(api.getCurrentUserID());
    if (String(senderID) === botID) return;

    const prefix = (global.config?.PREFIX || '').trim();
    if (prefix && body.trim().startsWith(prefix)) return;

    try {
        api.sendMessage(ADMIN_REPLY_MSG, threadID, messageID);
    } catch {}
};
