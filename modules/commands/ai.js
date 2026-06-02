const axios = require('axios');

module.exports.config = {
    name: "ai",
    aliases: ["chat", "gpt", "gemini", "ذكاء"],
    version: "4.0.0",
    hasPermssion: 0,
    credits: "Hitler System",
    description: "تحدث مع الذكاء الاصطناعي واسأله أي شيء",
    commandCategory: "ذكاء اصطناعي",
    usages: "ai [سؤالك]",
    cooldowns: 5
};

const SYSTEM = `أنت مساعد ذكي اسمه اليكسي. تتحدث باللغة العربية الفصحى دائماً.
ردودك دقيقة وواضحة ومتنوعة. لا تكرر نفس العبارات.
إذا سألك أحد باللغة الإنجليزية، أجبه بالعربية.
كن مفيداً، ودياً، ومباشراً.`;

async function askAI(question) {
    const seed = Math.floor(Math.random() * 999999);
    const enc = encodeURIComponent(question);
    const sys = encodeURIComponent(SYSTEM);

    const tries = [
        () => axios.get(`https://text.pollinations.ai/${enc}?model=openai&system=${sys}&seed=${seed}`, { timeout: 30000, responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0' } }),
        () => axios.get(`https://text.pollinations.ai/${enc}?model=mistral&system=${sys}&seed=${seed + 1}`, { timeout: 25000, responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0' } }),
        () => axios.get(`https://text.pollinations.ai/${encodeURIComponent('أجب بالعربية الفصحى: ' + question)}?model=openai&seed=${seed + 2}`, { timeout: 25000, responseType: 'text', headers: { 'User-Agent': 'Mozilla/5.0' } }),
        () => axios.post('https://text.pollinations.ai/', {
            messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: question }],
            model: 'openai', seed
        }, { timeout: 30000, headers: { 'Content-Type': 'application/json' } }),
    ];

    for (const tryFn of tries) {
        try {
            const res = await tryFn();
            const raw = typeof res.data === 'string' ? res.data : (res.data?.choices?.[0]?.message?.content || JSON.stringify(res.data));
            const text = raw.trim();
            if (text && text.length > 3 && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
                return text;
            }
        } catch { }
        await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error('all_failed');
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(' ').trim();

    if (!question) {
        return api.sendMessage(
            '🤖 اليكسي جاهز!\nاسأل أي شيء:\nمثال: ai ما هي عاصمة السعودية؟',
            threadID, messageID
        );
    }

    api.sendMessage('⏳ جاري التفكير...', threadID, async (err, info) => {
        try {
            const reply = await askAI(question);
            if (info?.messageID) try { api.unsendMessage(info.messageID); } catch {}
            api.sendMessage(`🤖 اليكسي:\n━━━━━━━━━━━━\n${reply}\n━━━━━━━━━━━━`, threadID, messageID);
        } catch {
            if (info?.messageID) try { api.unsendMessage(info.messageID); } catch {}
            api.sendMessage('⚠️ تعذّر الاتصال بالذكاء الاصطناعي، حاول لاحقاً.', threadID, messageID);
        }
    });
};
