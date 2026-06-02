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

function buildName(baseName, counter) {
    const char = INVIS[counter % INVIS.length];
    return baseName + char;
}

function startTakrar(api, threadID, name) {
    if (!global.moduleData.takrarLoops) global.moduleData.takrarLoops = {};
    if (global.moduleData.takrarLoops[threadID]) {
        global.moduleData.takrarLoops[threadID] = false;
    }
    global.moduleData.takrarLoops[threadID] = true;
    let counter = 0;

    async function loop() {
        if (!global.moduleData.takrarLoops || !global.moduleData.takrarLoops[threadID]) return;
        const newName = buildName(name, counter++);
        try {
            await new Promise((resolve) => {
                api.setTitle(newName, threadID, () => resolve());
            });
        } catch (e) {}
        await new Promise(r => setTimeout(r, 800));
        if (global.moduleData.takrarLoops && global.moduleData.takrarLoops[threadID]) {
            setImmediate(loop);
        }
    }
    loop();
}

module.exports.config = {
    name: "تكرار",
    version: "1.0.0",
    hasPermssion: 1,
    credits: "Hitler System",
    description: "يكرر اسم الكروب باستمرار لحمايته من التغيير",
    commandCategory: "النظام",
    usages: "تكرار [الاسم] | تكرار وقف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData.takrarLoops) global.moduleData.takrarLoops = {};
    const data = readHitler();
    if (!data.takrar) return;
    for (const [threadID, info] of Object.entries(data.takrar)) {
        startTakrar(api, threadID, info.name);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    if (!global.moduleData.takrarLoops) global.moduleData.takrarLoops = {};

    if (args[0] === 'وقف') {
        global.moduleData.takrarLoops[threadID] = false;
        const data = readHitler();
        if (data.takrar) delete data.takrar[threadID];
        writeHitler(data);
        return api.sendMessage('✅ تم إيقاف تكرار الاسم في هذا الكروب', threadID, messageID);
    }

    if (!args[0]) {
        return api.sendMessage('❌ يجب تحديد الاسم\nمثال: تكرار اسم الكروب', threadID, messageID);
    }

    const name = args.join(' ');

    const data = readHitler();
    if (!data.takrar) data.takrar = {};
    data.takrar[threadID] = { threadID, name };
    writeHitler(data);

    startTakrar(api, threadID, name);
    return api.sendMessage(`✅ تم تفعيل حماية اسم الكروب!\nالاسم: ${name}\nللإيقاف: تكرار وقف`, threadID, messageID);
};
