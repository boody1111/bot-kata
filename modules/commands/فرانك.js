const fs = require('fs-extra');
const path = require('path');

const HITLER_PATH = path.join(__dirname, 'cache', 'data', 'hitler.json');

const FRANK_MSG = `┇🦞 ┋AI bot ┋🦞┇

┇🦞┇𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆┇🦞┇

┇🦞┇𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆┇🦞┇



𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི┇𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི┇𖤓๋ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧ͜͡𝒵𔒜𓊆ྀི🇩🇪𓊇ྀི┇






┇𝐊𝐢𝐧𝐠┇ 𝐨𝐟 ┇𝐦𝐞𝐭𝐚┇ ┇🦞🙀┇
《🦞》 ⭒ ➠ ┇.
 ┇𝐊𝐢𝐧𝐠 ┇𝐒𝐨𝐜𝐢𝐚𝐥 ┇𝐌𝐞𝐝𝐢𝐚┇ ┇𝐇𝐨𝐧𝐝𝐚 ┇
┇🦞🇩🇪┇《🦞》
. ┇𝐇𝐨𝐧𝐝𝐚┇ 𝐆𝐞𝐫𝐦𝐚𝐧𝐲 ┇𝕾.㊑!..،،`;

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

function startFrank(api, threadID) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.frankIntervals) global.moduleData.frankIntervals = {};
    if (global.moduleData.frankIntervals[threadID]) {
        clearInterval(global.moduleData.frankIntervals[threadID]);
    }
    const interval = setInterval(() => {
        api.sendMessage(FRANK_MSG, threadID);
    }, 15000);
    global.moduleData.frankIntervals[threadID] = interval;
}

module.exports.config = {
    name: "فرانك",
    aliases: ["frank", "autoreply"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يرسل رسالة الرد التلقائي كل 15 ثانية بدون توقف",
    commandCategory: "النظام",
    usages: "فرانك | فرانك توقف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.frankIntervals) global.moduleData.frankIntervals = {};
    const data = readHitler();
    if (!data.frank) return;
    for (const threadID of Object.keys(data.frank)) {
        startFrank(api, threadID);
        console.log(`[فرانك] تم استعادة فرانك في: ${threadID}`);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.frankIntervals) global.moduleData.frankIntervals = {};

    if (args[0] === 'توقف') {
        if (global.moduleData.frankIntervals[threadID]) {
            clearInterval(global.moduleData.frankIntervals[threadID]);
            delete global.moduleData.frankIntervals[threadID];
        }
        const data = readHitler();
        if (data.frank) delete data.frank[threadID];
        writeHitler(data);
        return api.sendMessage('🛑 تم إيقاف فرانك', threadID, messageID);
    }

    const data = readHitler();
    if (!data.frank) data.frank = {};
    data.frank[threadID] = true;
    writeHitler(data);

    startFrank(api, threadID);
    api.sendMessage('✅ فرانك بدأ! يرسل كل 15 ثانية\nللإيقاف: فرانك توقف', threadID, messageID);
};
