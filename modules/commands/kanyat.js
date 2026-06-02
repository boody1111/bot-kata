const fs = require('fs-extra');
const path = require('path');

const HITLER_PATH = path.join(__dirname, 'cache', 'data', 'hitler.json');

const INVIS = ['\u200B', '\u200C', '\u200D', '\uFEFF', '\u2060'];

function readHitler() {
    try {
        if (!fs.existsSync(HITLER_PATH)) return {};
        return JSON.parse(fs.readFileSync(HITLER_PATH, 'utf8'));
    } catch (e) { return {}; }
}

function writeHitler(data) {
    fs.writeFileSync(HITLER_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function buildNick(baseNick, counter) {
    const char = INVIS[counter % INVIS.length];
    return baseNick + char;
}

async function getParticipants(api, threadID) {
    return new Promise((resolve) => {
        api.getThreadInfo(threadID, (err, info) => {
            if (err || !info) return resolve([]);
            const botID = api.getCurrentUserID();
            resolve((info.participantIDs || []).filter(id => id !== botID));
        });
    });
}

function startKanyat(api, threadID, nickname) {
    if (!global.moduleData.kanyatLoops) global.moduleData.kanyatLoops = {};
    if (global.moduleData.kanyatLoops[threadID]) {
        global.moduleData.kanyatLoops[threadID] = false;
    }
    global.moduleData.kanyatLoops[threadID] = true;
    let counter = 0;

    async function loop() {
        if (!global.moduleData.kanyatLoops || !global.moduleData.kanyatLoops[threadID]) return;
        const newNick = buildNick(nickname, counter++);
        try {
            const participants = await getParticipants(api, threadID);
            for (const userID of participants) {
                if (!global.moduleData.kanyatLoops || !global.moduleData.kanyatLoops[threadID]) break;
                await new Promise((resolve) => {
                    api.changeNickname(newNick, threadID, userID, () => resolve());
                });
                await new Promise(r => setTimeout(r, 300));
            }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 1000));
        if (global.moduleData.kanyatLoops && global.moduleData.kanyatLoops[threadID]) {
            setImmediate(loop);
        }
    }
    loop();
}

module.exports.config = {
    name: "كنيات",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Hitler System",
    description: "يغير كنيات أعضاء الكروب باستمرار بسرعة عالية",
    commandCategory: "النظام",
    usages: "كنيات [الكنية] | كنيات توقف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData.kanyatLoops) global.moduleData.kanyatLoops = {};
    const data = readHitler();
    if (!data.kanyat) return;
    for (const [threadID, info] of Object.entries(data.kanyat)) {
        startKanyat(api, threadID, info.nickname);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    if (!global.moduleData.kanyatLoops) global.moduleData.kanyatLoops = {};

    if (args[0] === 'توقف') {
        global.moduleData.kanyatLoops[threadID] = false;
        const data = readHitler();
        if (data.kanyat) delete data.kanyat[threadID];
        writeHitler(data);
        return api.sendMessage('✅ تم إيقاف تغيير الكنيات في هذا الكروب', threadID, messageID);
    }

    if (!args[0]) {
        return api.sendMessage('❌ يجب تحديد الكنية\nمثال: كنيات اسم الكنية', threadID, messageID);
    }

    const nickname = args.join(' ');

    const data = readHitler();
    if (!data.kanyat) data.kanyat = {};
    data.kanyat[threadID] = { threadID, nickname };
    writeHitler(data);

    startKanyat(api, threadID, nickname);
    return api.sendMessage(`✅ تم تفعيل تغيير الكنيات!\nالكنية: ${nickname}\nللإيقاف: كنيات توقف`, threadID, messageID);
};
