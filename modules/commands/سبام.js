const fs = require('fs-extra');
const path = require('path');

const HITLER_PATH = path.join(__dirname, 'cache', 'data', 'hitler.json');

const SPAM_MSGS = [
    "زٍ𝐁ـޢًَ⭊👑⥵ᷣ⃟ـُّّـُّّـُّّـُّّـّ",
    "ك̲̅͜͡ـِِـِـہ̲̅ـޢ𒄗ޢـس̲̅͜͡ـُہ̲̅ـ🥊ـم̲̅͜͜͡͡ـْـْْـْہ̲̅ـޢ𒄗ޢـكُ̲̅͜͜͡͡ـُہ̲̅",
    "ياولد ┋ قہٰٛ۬حہٰۣۧﹻٰ۫ﹻ🍆ﹻبہٰۣۧﹻۨـة",
    "ختك ┊القـًٌٍّ̨̥̬̩ـޢޢــﮩٰۙۧٛۗۦ۬❪🐌❫ـޢޢـح͎ہٰٚٛۦ۬⇇🎱⇉ـب̻ہٰٚٛﮩٰـة̲̅  ┊",
    "ڪہٰۣۧﹻۨ﹝🌪﹞؍ﹿٰٖٜ۬ﹿٰڛہٰٰٛﹻٰ۪۫ﹷٰم|⚪|ہٰۣۧﹻۨ؍ﹿٰٖٜ۬ﹿٰڪ┋",
    "آمـ❤ـكـ❤ـ",
    "كـ❤ـسـ❤ـمـ❤ـكـ❤ـ",
    "طـ❤ـيـ❤ـزِّمـ❤ـكـ❤ـ",
    "ديـ❤ـوٌثـ❤ـهّ",
    "شـ❤ـرمـ❤ـوٌطـ❤ـهّ",
    "كـ❤ـلَبـ❤ـهّ",
    "وٌسـ❤ـخـ❤ـهّ",
    "يـ❤ـبـ❤ـنـ❤ـ زِّآنـ❤ـيـ❤ـهّ",
    "الہٜۦٰٰٰٰٰٰٰٰٰ۪۫٭ـِۗـِـِٰۧۧہِٰٚۦٰٰٰٰٰٰٰٰٰ۪۫┊🔥┊ﻋ٭ـِٜہٰۣۧﹻۨ؍ۛﹻٰۛآ☀هہٰۣۧﹻۨ؍ۛ¦🪔¦ﹻۨ؍ۛﹻٰۛرﹻۨة",
    "¦ آلَـقَےـۦٰ٭ــ𝄒⃟∶𓇟̷ُ͜🧬ᭂ໋݊‌‍ࢪ|ـ<🐒>|دهۣۗ",
    "ہ ¦┋ نہٜۦٰٰٰٰٰٰٰٰٰ۪۫٭ـِۗـِـِٰۧۧيہِٰٚۦٰٰٰٰٰٰٰٰٰ۪۫٭ـِٜڪحہٰۣۧﹻۨ؍ۛﹻٰۛتہٰۣۧﹻۨ؍ۛ🌪شہٰ۪۫ﹷٰٰﹷونيہِٰٚۦٰٰٰٰٰٰٰٰٰ۪۫٭🏴‍☠️ـِٜمہٰٛ۬ﹻۨ؍ۛﹻٰۛاڪ ┋",
    "كـ🌙ـسـ🌙ـمـ🌙ـكـ🌙ـ",
    "كـ🌙ـسـ🌙ـخـ🌙ـتـ🌙ـكـ🌙ـ",
    "آنـ🌙ـيـ🌙ـكـ🌙ـ مـ🌙ـكـ🌙ـ",
    "يـ🌙ـبـ🌙ـنـ🌙ـ قـ🌙ـحـ🌙ـبـ🌙ـهّ",
    "ربـ🌙ـمـ🌙ـكـ🌙ـ",
    "كـ🌙ـسـ🌙ـخـ🌙ـتـ🌙ـكـ🌙ـ",
    "كـ🌙ـسـ🌙ـبـ🌙ـوٌكـ🌙ـ",
    "كـ🌙ـسـ🌙ـخـ🌙ـآلَتـ🌙ـكـ🌙ـ",
    "كـ🌙ـسـ🌙ـنـ🌙ـيـ🌙ـنـ🌙ـكـ🌙ـ",
    "كـ🌙ـسـ🌙ـ",
    "مـ🌙ـصـ🌙ـ",
    "مـ🌙ـصـ🌙ـ زِّبـ🌙ـيـ🌙ـ",
    "يـ🌙ـآ خـ🌙ـوٌلَ",
    "يـ🌙ـبـ🌙ـنـ🌙ـ آلَقـ🌙ـحـ🌙ـبـ🌙ـهّ",
    "آلَعـ🌙ـنـ🌙ـ كـ🌙ـسـ🌙ـمـ🌙ـكـ🌙ـ"
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

function randomMsg() {
    return SPAM_MSGS[Math.floor(Math.random() * SPAM_MSGS.length)];
}

function startSpam(api, threadID) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.spamIntervals) global.moduleData.spamIntervals = {};
    if (global.moduleData.spamIntervals[threadID]) {
        clearInterval(global.moduleData.spamIntervals[threadID]);
    }

    const interval = setInterval(() => {
        api.sendMessage(randomMsg(), threadID);
    }, 3000);

    global.moduleData.spamIntervals[threadID] = interval;
}

module.exports.config = {
    name: "سبام",
    aliases: ["spam"],
    version: "1.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "يرسل رسائل عشوائية بشكل متواصل حتى الإيقاف",
    commandCategory: "النظام",
    usages: ".سبام | .سبام توقف",
    cooldowns: 0
};

module.exports.onLoad = function ({ api }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.spamIntervals) global.moduleData.spamIntervals = {};
    const data = readHitler();
    if (!data.spam) return;
    for (const threadID of Object.keys(data.spam)) {
        startSpam(api, threadID);
        console.log(`[سبام] تم استعادة السبام في: ${threadID}`);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.spamIntervals) global.moduleData.spamIntervals = {};

    if (args[0] === 'توقف') {
        if (global.moduleData.spamIntervals[threadID]) {
            clearInterval(global.moduleData.spamIntervals[threadID]);
            delete global.moduleData.spamIntervals[threadID];
        }
        const data = readHitler();
        if (data.spam) delete data.spam[threadID];
        writeHitler(data);
        return api.sendMessage('🛑 تم إيقاف السبام', threadID, messageID);
    }

    const data = readHitler();
    if (!data.spam) data.spam = {};
    data.spam[threadID] = true;
    writeHitler(data);

    startSpam(api, threadID);
    api.sendMessage('💬 السبام بدأ! يرسل كل 3 ثواني\nللإيقاف: .سبام توقف', threadID, messageID);
};
