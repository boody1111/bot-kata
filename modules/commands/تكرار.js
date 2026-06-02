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

function startNameProtect(api, threadID, groupName) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.nameProtect) global.moduleData.nameProtect = {};

    if (global.moduleData.nameProtect[threadID]) {
        clearInterval(global.moduleData.nameProtect[threadID]);
    }

    api.setTitle(groupName, threadID);

    const interval = setInterval(async () => {
        try {
            const info = await api.getThreadInfo(threadID);
            if (info.threadName !== groupName) {
                api.setTitle(groupName, threadID);
            }
        } catch {}
    }, 10000);

    global.moduleData.nameProtect[threadID] = interval;
}

module.exports.config = {
    name: "حفظ",
    aliases: ["protectname"],
    version: "2.0.0",
    hasPermssion: 2,
    credits: "Hitler System",
    description: "حماية اسم الجروب",
    commandCategory: "النظام",
    usages: "حفظ [اسم الجروب] | حفظ توقف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.nameProtect) global.moduleData.nameProtect = {};

    const data = readHitler();
    if (!data.nameProtect) return;

    for (const [threadID, name] of Object.entries(data.nameProtect)) {
        startNameProtect(api, threadID, name);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID } = event;

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.nameProtect) global.moduleData.nameProtect = {};

    // إيقاف الحماية (صامت)
    if (args[0] === 'توقف') {
        if (global.moduleData.nameProtect[threadID]) {
            clearInterval(global.moduleData.nameProtect[threadID]);
            delete global.moduleData.nameProtect[threadID];
        }

        const data = readHitler();
        if (data.nameProtect) delete data.nameProtect[threadID];
        writeHitler(data);
        return;
    }

    const groupName = args.join(' ').trim();
    if (!groupName) return;

    const data = readHitler();
    if (!data.nameProtect) data.nameProtect = {};
    data.nameProtect[threadID] = groupName;
    writeHitler(data);

    startNameProtect(api, threadID, groupName);

    // بدون أي رسالة إطلاقاً
};