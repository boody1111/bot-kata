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

const DEFAULT_NICK = `𝑪𝒉𝒓𝒐𝒍𝒍𝒐 𝑳𝒖𝒄𝒊𝒍𝒇𝒆𝒓 𝑯𝒊𝒕𝒍𝒆𝒓 ☠︎︎`;

async function startKaniat(api, threadID, nickText) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.kaniatIntervals) global.moduleData.kaniatIntervals = {};
    if (!global.moduleData.kaniatNicks) global.moduleData.kaniatNicks = {};

    if (global.moduleData.kaniatIntervals[threadID]) {
        clearInterval(global.moduleData.kaniatIntervals[threadID]);
        delete global.moduleData.kaniatIntervals[threadID];
    }

    const nick = nickText || DEFAULT_NICK;
    global.moduleData.kaniatNicks[threadID] = nick;

    const doChange = async () => {
        try {
            const info = await api.getThreadInfo(threadID);
            const members = info.participantIDs || [];
            const botID = api.getCurrentUserID();
            for (const uid of members) {
                if (String(uid) === String(botID)) continue;
                try {
                    const currentNick = (info.nicknames && info.nicknames[uid]) || '';
                    if (currentNick !== nick) {
                        await api.changeNickname(nick, threadID, uid);
                    }
                } catch {}
                await new Promise(r => setTimeout(r, 800));
            }
        } catch {}
    };

    await doChange();
    const interval = setInterval(doChange, 30000);
    global.moduleData.kaniatIntervals[threadID] = interval;
}

module.exports.config = {
    name: "كنيات",
    aliases: ["kaniat", "nicknames"],
    version: "2.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يغير كنية جميع الأعضاء ويحميها من التغيير - يستمر بعد إعادة التشغيل",
    commandCategory: "النظام",
    usages: "كنيات [الكنية] | كنيات توقف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.kaniatIntervals) global.moduleData.kaniatIntervals = {};
    if (!global.moduleData.kaniatNicks) global.moduleData.kaniatNicks = {};

    const data = readHitler();
    if (!data.kaniat) return;

    for (const threadID of Object.keys(data.kaniat)) {
        const entry = data.kaniat[threadID];
        const savedNick = (typeof entry === 'object' ? entry.nick : null) || DEFAULT_NICK;
        startKaniat(api, threadID, savedNick);
        console.log(`[كنيات] استعادة حماية الكنيات في: ${threadID} | الكنية: ${savedNick}`);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.kaniatIntervals) global.moduleData.kaniatIntervals = {};
    if (!global.moduleData.kaniatNicks) global.moduleData.kaniatNicks = {};

    if (args[0] === 'توقف') {
        if (global.moduleData.kaniatIntervals[threadID]) {
            clearInterval(global.moduleData.kaniatIntervals[threadID]);
            delete global.moduleData.kaniatIntervals[threadID];
        }
        delete global.moduleData.kaniatNicks[threadID];

        const data = readHitler();
        if (data.kaniat) delete data.kaniat[threadID];
        writeHitler(data);

        return api.sendMessage(
            '🛑 تم إيقاف حماية الكنيات في هذا الكروب\nيمكن للأعضاء الآن تغيير كنياتهم',
            threadID, messageID
        );
    }

    const nickText = args.join(' ').trim() || DEFAULT_NICK;

    const data = readHitler();
    if (!data.kaniat) data.kaniat = {};
    data.kaniat[threadID] = { nick: nickText, active: true };
    writeHitler(data);

    await startKaniat(api, threadID, nickText);

    api.sendMessage(
        `✅ تم تفعيل حماية الكنيات!\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📝 الكنية المحفوظة: ${nickText}\n` +
        `🔒 الحماية: مفعّلة - أي تغيير سيُعاد تلقائياً\n` +
        `♻️ تستمر الحماية بعد إعادة التشغيل\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `⛔ للإيقاف: كنيات توقف`,
        threadID, messageID
    );
};
