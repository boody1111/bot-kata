const fs = require('fs-extra');
const path = require('path');

const HITLER_PATH = path.join(__dirname, 'cache', 'data', 'hitler.json');

function readHitler() {
    try {
        fs.ensureDirSync(path.dirname(HITLER_PATH));
        if (!fs.existsSync(HITLER_PATH)) return {};
        const data = JSON.parse(fs.readFileSync(HITLER_PATH, 'utf8'));
        return (typeof data === 'object' && !Array.isArray(data)) ? data : {};
    } catch (e) { return {}; }
}

function writeHitler(data) {
    try {
        fs.ensureDirSync(path.dirname(HITLER_PATH));
        fs.writeFileSync(HITLER_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch(e) {}
}

module.exports.config = {
    name: "ايقاف",
    version: "2.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يوقف وضع الأدمن ويعيد البوت للعمل مع الجميع",
    commandCategory: "النظام",
    usages: "ايقاف",
    cooldowns: 0
};

module.exports.onLoad = function () {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.adminOnlyThreads) global.moduleData.adminOnlyThreads = {};
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.adminOnlyThreads) global.moduleData.adminOnlyThreads = {};

    if (!global.moduleData.adminOnlyThreads[threadID]) {
        return api.sendMessage('⚠️ وضع الأدمن غير مفعّل في هذا الكروب أصلاً', threadID, messageID);
    }

    delete global.moduleData.adminOnlyThreads[threadID];

    const data = readHitler();
    if (data.adminOnly) delete data.adminOnly[threadID];
    writeHitler(data);

    const remaining = data.adminOnly ? Object.keys(data.adminOnly).length : 0;

    return api.sendMessage(
        '✅ تم إيقاف وضع الأدمن!\n' +
        '🔓 البوت الآن يرد على الجميع في هذا الكروب\n' +
        `📊 الكروبات المتبقية في وضع الأدمن: ${remaining}`,
        threadID, messageID
    );
};
