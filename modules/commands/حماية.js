const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

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

if (!global.moduleData) global.moduleData = {};
if (!global.moduleData.himayaActive) global.moduleData.himayaActive = {};
if (!global.moduleData.himayaSaved) global.moduleData.himayaSaved = {};

module.exports.config = {
    name: "حماية",
    aliases: ["himaya", "protect"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يحمي اسم الكروب وصورته وكنية البوت والمطور من التغيير — يستمر بعد إعادة التشغيل",
    commandCategory: "النظام",
    usages: "حماية | حماية توقف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.himayaActive) global.moduleData.himayaActive = {};
    if (!global.moduleData.himayaSaved) global.moduleData.himayaSaved = {};

    const data = readHitler();
    if (!data.himaya) return;

    for (const [threadID, info] of Object.entries(data.himaya)) {
        global.moduleData.himayaActive[threadID] = true;
        global.moduleData.himayaSaved[threadID] = info;
        console.log(`[حماية] تم استعادة الحماية في: ${threadID}`);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.himayaActive) global.moduleData.himayaActive = {};
    if (!global.moduleData.himayaSaved) global.moduleData.himayaSaved = {};

    if (args[0] === 'توقف') {
        delete global.moduleData.himayaActive[threadID];
        delete global.moduleData.himayaSaved[threadID];
        const data = readHitler();
        if (data.himaya) delete data.himaya[threadID];
        writeHitler(data);
        return api.sendMessage('🔓 تم إيقاف حماية هذا الكروب', threadID, messageID);
    }

    try {
        const info = await api.getThreadInfo(threadID);
        const botID = api.getCurrentUserID();
        const botNick = (info.nicknames && info.nicknames[botID]) || (global.config.BOTNAME || '');
        const adminID = (global.config.ADMINBOT || [])[0] || '';
        const devNick = (info.nicknames && info.nicknames[adminID]) || (global.config.AMDIN_NAME || '');
        const groupName = info.threadName || '';
        const groupImage = info.imageSrc || '';

        const saved = { botID, botNick, adminID, devNick, groupName, groupImage };
        global.moduleData.himayaActive[threadID] = true;
        global.moduleData.himayaSaved[threadID] = saved;

        const data = readHitler();
        if (!data.himaya) data.himaya = {};
        data.himaya[threadID] = saved;
        writeHitler(data);

        api.sendMessage(
            `🛡️ تم تفعيل الحماية لهذا الكروب!\n\n` +
            `✅ اسم الكروب: ${groupName || 'غير محدد'}\n` +
            `✅ كنية البوت: ${botNick || 'غير محدد'}\n` +
            `✅ كنية المطور: ${devNick || 'غير محدد'}\n\n` +
            `أي تغيير سيتم التراجع عنه تلقائياً\nللإيقاف: حماية توقف`,
            threadID, messageID
        );
    } catch (e) {
        api.sendMessage('❌ حدث خطأ أثناء تفعيل الحماية', threadID, messageID);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, logMessageType, logMessageData } = event;

    if (!global.moduleData || !global.moduleData.himayaActive) return;
    if (!global.moduleData.himayaActive[threadID]) return;

    const saved = (global.moduleData.himayaSaved || {})[threadID];
    if (!saved) return;

    try {
        if (logMessageType === 'log:thread-name') {
            if (saved.groupName && logMessageData.name !== saved.groupName) {
                await api.setTitle(saved.groupName, threadID);
                api.sendMessage(`🛡️ تم التراجع عن تغيير اسم الكروب! الاسم الأصلي: ${saved.groupName}`, threadID);
            }
        }

        if (logMessageType === 'log:thread-image') {
            if (saved.groupImage) {
                try {
                    const res = await axios.get(saved.groupImage, { responseType: 'stream' });
                    await api.changeGroupImage(res.data, threadID);
                    api.sendMessage('🛡️ تم التراجع عن تغيير صورة الكروب!', threadID);
                } catch {}
            }
        }

        if (logMessageType === 'log:user-nickname') {
            const changedID = logMessageData.participant_id;
            if (String(changedID) === String(saved.botID) && saved.botNick) {
                try {
                    await api.changeNickname(saved.botNick, threadID, saved.botID);
                    api.sendMessage(`🛡️ تم التراجع عن تغيير كنية البوت!`, threadID);
                } catch {}
            }
            if (String(changedID) === String(saved.adminID) && saved.devNick) {
                try {
                    await api.changeNickname(saved.devNick, threadID, saved.adminID);
                    api.sendMessage(`🛡️ تم التراجع عن تغيير كنية المطور!`, threadID);
                } catch {}
            }
        }
    } catch {}
};
