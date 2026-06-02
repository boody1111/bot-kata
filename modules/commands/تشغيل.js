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
    name: "تشغيل",
    version: "3.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يجعل البوت يرد على مشرفي البوت فقط في هذا الكروب (بما فيها إشعارات الدخول والخروج)",
    commandCategory: "النظام",
    usages: "تشغيل",
    cooldowns: 0
};

module.exports.onLoad = function () {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.adminOnlyThreads) global.moduleData.adminOnlyThreads = {};

    const data = readHitler();
    if (!data.adminOnly) return;

    let count = 0;
    for (const threadID of Object.keys(data.adminOnly)) {
        if (data.adminOnly[threadID] === true) {
            global.moduleData.adminOnlyThreads[threadID] = true;
            count++;
        }
    }
    if (count > 0) console.log(`[تشغيل] تم استعادة وضع الأدمن في ${count} كروب`);
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.adminOnlyThreads) global.moduleData.adminOnlyThreads = {};

    if (global.moduleData.adminOnlyThreads[threadID]) {
        return api.sendMessage(
            '⚠️ وضع الأدمن فعّال مسبقاً في هذا الكروب\n' +
            'البوت يرد على المطورين فقط\n' +
            'لإيقافه اكتب: ايقاف',
            threadID, messageID
        );
    }

    global.moduleData.adminOnlyThreads[threadID] = true;

    const data = readHitler();
    if (!data.adminOnly) data.adminOnly = {};
    data.adminOnly[threadID] = true;
    writeHitler(data);

    const totalGroups = Object.keys(data.adminOnly).length;

    return api.sendMessage(
        '✅ تم تفعيل وضع الأدمن!\n' +
        '🔒 البوت الآن يرد على مشرفي البوت فقط\n' +
        '🔕 إشعارات الدخول والخروج معطّلة\n' +
        `📊 الكروبات المفعّلة الآن: ${totalGroups}\n` +
        'لإيقافه اكتب: ايقاف',
        threadID, messageID
    );
};
