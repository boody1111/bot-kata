const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const HITLER_PATH = path.join(__dirname, 'cache', 'data', 'hitler.json');

const SYSTEM_FUSHA = `أنت مساعد ذكي اسمه ريمو. تتحدث باللغة العربية الفصحى دائماً وحصراً. 
ردودك واقعية ومتنوعة وطبيعية، لا تكرر نفس العبارات أبداً.
أجب بشكل مختصر ومباشر (جملة أو جملتان). 
كن ذكياً وخفيف الظل. لا تذكر أنك ذكاء اصطناعي.
إذا جاءك كلام مسيء، رد بكبرياء وبدون انزعاج.`;

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

const lastReply = {};
const RATE_LIMIT_MS = 3000;

async function askRemo(question) {
    const seed = Math.floor(Math.random() * 999999);
    const prompt = encodeURIComponent(question);
    const system = encodeURIComponent(SYSTEM_FUSHA);

    const endpoints = [
        `https://text.pollinations.ai/${prompt}?model=openai&system=${system}&seed=${seed}&json=false`,
        `https://text.pollinations.ai/${prompt}?model=mistral&system=${system}&seed=${seed + 1}`,
        `https://text.pollinations.ai/${prompt}?model=openai&seed=${seed + 2}`,
        `https://text.pollinations.ai/${encodeURIComponent('أجب بالعربية الفصحى: ' + question)}?model=openai&seed=${seed + 3}`,
    ];

    for (const url of endpoints) {
        try {
            const res = await axios.get(url, {
                timeout: 30000,
                responseType: 'text',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124',
                    'Accept': 'text/plain, */*'
                }
            });
            const text = (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)).trim();
            if (text && text.length > 3 && !text.toLowerCase().includes('<!doctype') && !text.includes('<html')) {
                return text;
            }
        } catch { continue; }
        await new Promise(r => setTimeout(r, 1500));
    }

    // POST fallback
    try {
        const res = await axios.post('https://text.pollinations.ai/', {
            messages: [
                { role: 'system', content: SYSTEM_FUSHA },
                { role: 'user', content: question }
            ],
            model: 'openai',
            seed: seed
        }, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });
        const text = (typeof res.data === 'string' ? res.data : (res.data?.choices?.[0]?.message?.content || '')).trim();
        if (text && text.length > 3) return text;
    } catch {}

    throw new Error('all_failed');
}

module.exports.config = {
    name: "ريمو",
    aliases: ["remo", "rimo"],
    version: "3.0.0",
    hasPermssion: 2,
    credits: "Hitler System",
    description: "ذكاء اصطناعي بالفصحى - يرد على أي سؤال أو على كل رسائل الجروب",
    commandCategory: "ذكاء اصطناعي",
    usages: "ريمو [سؤالك] | ريمو تشغيل | ريمو إيقاف",
    cooldowns: 3
};

module.exports.onLoad = function () {
    const data = readHitler();
    if (!data.remo) return;
    if (!global.moduleData) global.moduleData = {};
    global.moduleData.remoActive = data.remo;
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const input = args.join(' ').trim();

    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.remoActive) global.moduleData.remoActive = {};

    if (!input) {
        return api.sendMessage(
            '🤖 ريمو جاهز!\n\n' +
            '• ريمو [سؤالك] ← يجيبك\n' +
            '• ريمو تشغيل ← يرد على الجميع في الكروب\n' +
            '• ريمو إيقاف ← يتوقف عن الرد التلقائي',
            threadID, messageID
        );
    }

    if (input === 'تشغيل') {
        global.moduleData.remoActive[threadID] = true;
        const data = readHitler();
        if (!data.remo) data.remo = {};
        data.remo[threadID] = true;
        writeHitler(data);
        return api.sendMessage('✅ ريمو الآن يرد على جميع رسائل المجموعة.', threadID, messageID);
    }

    if (['إيقاف', 'ايقاف', 'وقف', 'توقف', 'stop'].includes(input)) {
        delete global.moduleData.remoActive[threadID];
        const data = readHitler();
        if (data.remo) delete data.remo[threadID];
        writeHitler(data);
        return api.sendMessage('🔴 تم إيقاف ريمو في هذه المجموعة.', threadID, messageID);
    }

    api.sendMessage('💭 جاري التفكير...', threadID, async (err, info) => {
        try {
            const reply = await askRemo(input);
            if (info?.messageID) try { api.unsendMessage(info.messageID); } catch {}
            api.sendMessage(reply, threadID, messageID);
        } catch {
            if (info?.messageID) try { api.unsendMessage(info.messageID); } catch {}
            api.sendMessage('⚠️ تعذّر الاتصال بالذكاء الاصطناعي، حاول مجدداً.', threadID, messageID);
        }
    });
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body, type } = event;

    if (type !== 'message' && type !== 'message_reply') return;
    if (!body || !body.trim() || body.length < 2) return;

    if (!global.moduleData?.remoActive?.[threadID]) return;

    try {
        const botID = api.getCurrentUserID();
        if (senderID === botID) return;
    } catch {}

    // تجاهل الأوامر
    const firstWord = body.trim().split(/\s+/)[0].toLowerCase().replace(/^[.!#/]/, '');
    if (global.client?.commands?.has(firstWord)) return;

    // Rate limit
    const now = Date.now();
    if (lastReply[threadID] && now - lastReply[threadID] < RATE_LIMIT_MS) return;
    lastReply[threadID] = now;

    try {
        const reply = await askRemo(body.trim());
        if (reply) {
            lastReply[threadID] = Date.now();
            api.sendMessage(reply, threadID, (err) => {}, messageID);
        }
    } catch {}
};
