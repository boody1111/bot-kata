const fs = require('fs-extra');
const path = require('path');

const HITLER_PATH = path.join(__dirname, 'cache', 'data', 'hitler.json');

const KASHMIR_MSGS = [
    "𝙆𝘼𝙎𝙃𝙈𝙄𝙍 ☠︎︎ 𝙆𝘼𝙎𝙃𝙈𝙄𝙍 ☠︎︎ 𝙆𝘼𝙎𝙃𝙈𝙄𝙍",
    "🔱 كـاشـمـيـر 🔱 كـاشـمـيـر 🔱 كـاشـمـيـر 🔱",
    "⚡️┊𝑲𝑨𝑺𝑯𝑴𝑰𝑹┊⚡️ ☠︎︎ ⚡️┊𝑲𝑨𝑺𝑯𝑴𝑰𝑹┊⚡️",
    "𝙆 →┊✘┊→ 𝘼 →┊ ☠︎︎ ┊→ 𝙎 →┊✘┊→ 𝙃 →┊ ☠︎︎ ┊→ 𝙈 →┊✘┊→ 𝙄 →┊ ☠︎︎ ┊→ 𝙍",
    "𝐊𝐀𝐒𝐇𝐌𝐈𝐑 🕸 𝐊𝐀𝐒𝐇𝐌𝐈𝐑 🕸 𝐊𝐀𝐒𝐇𝐌𝐈𝐑",
    "كـ☠ـاشـ☠ـمـ☠ـيـ☠ـر كـ☠ـاشـ☠ـمـ☠ـيـ☠ـر",
    "⭊ كاشمير ⭊ كاشمير ⭊ كاشمير ⭊ كاشمير ⭊",
    "𝑲𝑰𝑵𝑮 𝑲𝑨𝑺𝑯𝑴𝑰𝑹 👑 𝑲𝑰𝑵𝑮 𝑲𝑨𝑺𝑯𝑴𝑰𝑹 👑",
];

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

function startKashmir(api, threadID) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.kashmirIntervals) global.moduleData.kashmirIntervals = {};
    if (global.moduleData.kashmirIntervals[threadID]) {
        clearInterval(global.moduleData.kashmirIntervals[threadID]);
    }

    let i = 0;
    const interval = setInterval(() => {
        const msg = KASHMIR_MSGS[i % KASHMIR_MSGS.length];
        i++;
        api.sendMessage(msg, threadID);
    }, 2000);

    global.moduleData.kashmirIntervals[threadID] = interval;
}

module.exports.config = {
    name: "كاشمير",
    aliases: ["kashmir"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "فيضان رسائل كاشمير المتواصل حتى الإيقاف",
    commandCategory: "المطور",
    usages: "كاشمير | كاشمير توقف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.kashmirIntervals) global.moduleData.kashmirIntervals = {};
    const data = readHitler();
    if (!data.kashmir) return;
    for (const threadID of Object.keys(data.kashmir)) {
        startKashmir(api, threadID);
        console.log(`[كاشمير] استعادة كاشمير في: ${threadID}`);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.kashmirIntervals) global.moduleData.kashmirIntervals = {};

    if (args[0] === 'توقف') {
        if (global.moduleData.kashmirIntervals[threadID]) {
            clearInterval(global.moduleData.kashmirIntervals[threadID]);
            delete global.moduleData.kashmirIntervals[threadID];
        }
        const data = readHitler();
        if (data.kashmir) delete data.kashmir[threadID];
        writeHitler(data);
        return api.sendMessage('🛑 تم إيقاف كاشمير', threadID, messageID);
    }

    const data = readHitler();
    if (!data.kashmir) data.kashmir = {};
    data.kashmir[threadID] = true;
    writeHitler(data);

    startKashmir(api, threadID);
    api.sendMessage('🔱 كاشمير بدأ! يرسل كل 2 ثانية\nللإيقاف: كاشمير توقف', threadID, messageID);
};
