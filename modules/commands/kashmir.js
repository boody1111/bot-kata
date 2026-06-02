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

const COOLDOWN_MS = 15000;

const AUTO_REPLY_MSG = `𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆 
(
Auto Reply:*
Auto Reply:*

𝑲┋⃢🛞┋↝ ❪𒄆❫↬〖🛞〗𝑺 ┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑴 ⃢┋🛞┋↝ ❪𒄆❫↬〖🛞⃢〗𝑲 𝒀┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑨 𝑾┋🛞⃢┋↝ ❪𒄆❫↬〖🛞〗𝑳 ┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑫 𝟫 ┋🛞┋⃢↝ ❪𒄆❫↬〖🛞〗𝑨 ┋⃢🛞┋↝ ❪𒄆❫↬〖🛞〗𝑯 ┋🛞┋↝ ❪𒄆❫↬〖🛞〗⃢𝑩 ┋🛞┋↝ ❪𒄆❫⃢↬〖🛞〗𝑨 𝟥┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑺 ┋🛞┋↝ ⃢❪𒄆❫↬⃢〖🛞〗𝑴 ┋🛞┋⃢↝ ❪𒄆❫↬〖🛞〗𝑲 𝑾┋🛞⃢┋↝ ❪𒄆❫↬〖⃢🛞〗𝑨 𝑶┋🛞┋⃢↝ ❪𒄆❫↬〖🛞〗𝑴 ┋🛞┋↝ ❪𒄆❫⃢↬〖🛞〗𝑨 ┋⃢🛞┋↝ ❪𒄆❫↬〖🛞〗𝑯┋🛞┋↝ ❪𒄆❫↬〖⃢🛞〗𝑯𝑨⃢ ┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑻 𝑶┋🛞┋⃢↝ ❪𒄆❫↬〖🛞〗𝑴┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑲 𝑵 ┋🛞⃢┋↝ ❪𒄆❫↬⃢〖🛞〗𝑰 ┋🛞┋↝⃢ ❪𒄆❫↬〖🛞〗𝑲 𝑲┋🛞⃢┋↝ ❪𒄆❫⃢↬〖🛞〗𝑺 ┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑴 ┋🛞┋⃢↝ ❪𒄆❫↬〖🛞〗𝑲 𝒀┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑨 𝑾┋🛞⃢┋↝ ❪𒄆❫↬〖🛞〗𝑳 ┋🛞⃢┋↝ ❪𒄆❫↬〖🛞〗𝑫 𝟫 ┋🛞⃢┋↝ ❪𒄆❫↬〖🛞〗𝑨 ┋🛞┋⃢↝ ❪𒄆❫↬⃢〖🛞〗𝑯 ┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑩 ┋🛞┋⃢↝ ❪𒄆❫↬〖🛞〗𝑨 𝟥┋🛞┋↝ ❪𒄆❫↬〖🛞〗𝑺 ┋🛞⃢┋↝ ❪𒄆❫↬〖🛞〗𝑴 ┋🛞⃢┋↝ ❪𒄆❫↬〖🛞〗𝑲

༴‌؍.𝐖𝐄 𝐒𝐓𝐀𝐍𝐃 𝐀𝐓 𝐓𝐇𝐄 𝐓𝐎𝐏 𝐎𝐅 𝐀𝐋𝐋⚰️؍』

●‌‌─‌‌☠︎︎
𝐈𝐟 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐟𝐫𝐨𝐦 𝐕𝐀𝐋𝐎𝐑𝐌𝐀, 𝐛𝐞 𝐩𝐫𝐨𝐮𝐝 𝐟𝐨𝐫 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐮𝐧𝐝𝐞𝐫 𝐭𝐡𝐞 𝐩𝐫𝐨𝐭𝐞𝐜𝐭𝐢𝐨𝐧 𝐨𝐟 𝐀𝐫𝐛𝐞𝐫𝐭.[💂🏻‍♂️] 

ِ

『༴‌☠︎︎⋆‌🐞』⇣؍.َِ

ُ『𝑲𝑰𝑵𝑮┆𝑨𝑳𝑰𝑿』..
ٓ
ُ
⟬👿⟭) 𝗩𝗮𝗹𝗼𝗿𝗺𝗮 ِ  ⟬👿⟭)
`;

module.exports.config = {
    name: "كاشمير",
    aliases: ["kashmir"],
    version: "2.0.0",
    hasPermssion: 2,
    credits: "اربرت اليكسي",
    description: "الرد التلقائي على كل رسالة في الكروب بفارق 15 ثانية — يستمر بعد إعادة التشغيل",
    commandCategory: "النظام",
    usages: "كاشمير | كاشمير توقف",
    cooldowns: 3
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.kashmirActive) global.moduleData.kashmirActive = {};
    if (!global.moduleData.kashmirCooldown) global.moduleData.kashmirCooldown = {};

    const data = readHitler();
    if (!data.kashmir) return;
    for (const threadID of Object.keys(data.kashmir)) {
        global.moduleData.kashmirActive[threadID] = true;
        console.log(`[كاشمير] تم استعادة الرد التلقائي في: ${threadID}`);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.kashmirActive) global.moduleData.kashmirActive = {};
    if (!global.moduleData.kashmirCooldown) global.moduleData.kashmirCooldown = {};

    const arg = (args[0] || '').toLowerCase();

    if (arg === 'توقف' || arg === 'stop' || arg === 'off') {
        delete global.moduleData.kashmirActive[threadID];
        delete global.moduleData.kashmirCooldown[threadID];
        const data = readHitler();
        if (data.kashmir) delete data.kashmir[threadID];
        writeHitler(data);
        return api.sendMessage('⛔ تم إيقاف الرد التلقائي في هذا الكروب!\n𝙆𝙖𝙨𝙝𝙢𝙞𝙧 𝙊𝙁𝙁', threadID, messageID);
    }

    if (global.moduleData.kashmirActive[threadID]) {
        return api.sendMessage('✅ الرد التلقائي مفعل بالفعل!\nأرسل كاشمير توقف لإيقافه.', threadID, messageID);
    }

    global.moduleData.kashmirActive[threadID] = true;
    const data = readHitler();
    if (!data.kashmir) data.kashmir = {};
    data.kashmir[threadID] = true;
    writeHitler(data);

    return api.sendMessage(
        `✅ تم تفعيل الرد التلقائي في هذا الكروب!\n⏱ سيرد البوت على كل رسالة بعد 15 ثانية.\n🔴 لإيقافه أرسل: كاشمير توقف\n\n𝙆𝙖𝙨𝙝𝙢𝙞𝙧 𝙊𝙉 ☠︎︎`,
        threadID, messageID
    );
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, body, type } = event;

    if (!global.moduleData || !global.moduleData.kashmirActive) return;
    if (!global.moduleData.kashmirActive[threadID]) return;
    if (!body || !body.trim()) return;
    if (String(senderID) === String(api.getCurrentUserID())) return;

    if (!global.moduleData.kashmirCooldown) global.moduleData.kashmirCooldown = {};

    const PREFIX = (global.config?.PREFIX || '').trim();
    if (PREFIX && body.trim().startsWith(PREFIX)) {
        const cmdWord = body.trim().slice(PREFIX.length).trim().split(/\s+/)[0].toLowerCase();
        if (global.client.commands.has(cmdWord)) return;
    } else if (!PREFIX) {
        const firstWord = body.trim().split(/\s+/)[0].toLowerCase();
        if (global.client.commands.has(firstWord)) return;
    }

    const now = Date.now();
    const last = global.moduleData.kashmirCooldown[threadID] || 0;
    if (now - last < COOLDOWN_MS) return;

    global.moduleData.kashmirCooldown[threadID] = now;

    const replyToMsgID = event.messageID;
    setTimeout(() => {
        if (!global.moduleData.kashmirActive || !global.moduleData.kashmirActive[threadID]) return;
        api.sendMessage(AUTO_REPLY_MSG, threadID, (err) => {}, replyToMsgID);
    }, COOLDOWN_MS);
};
