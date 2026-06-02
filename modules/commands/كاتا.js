const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { Readable } = require('stream');

module.exports.config = {
    name: "كاتا",
    aliases: ["kata", "fight", "action"],
    version: "2.0.0",
    hasPermssion: 0,
    credits: "اربرت اليكسي",
    description: "يرسل صور أكشن وقتال من الأنمي",
    commandCategory: "صور عشوائية",
    usages: "كاتا [hug/kiss/slap/cuddle/pat/shoot]",
    cooldowns: 10
};

const ACTION_CATEGORIES = ['hug', 'kiss', 'slap', 'cuddle', 'pat', 'shoot', 'stab', 'punch', 'poke', 'bite'];

const CACHE_DIR = path.join(__dirname, 'cache', 'img');

async function fetchActionGif(category) {
    const cat = category || ACTION_CATEGORIES[Math.floor(Math.random() * ACTION_CATEGORIES.length)];
    const res = await axios.get(`https://api.waifu.pics/sfw/${cat}`, { timeout: 15000 });
    return { url: res.data.url, cat };
}

async function downloadToBuffer(url) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return Buffer.from(res.data);
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const input = (args[0] || '').toLowerCase().trim();
    const validCats = ACTION_CATEGORIES;
    const category = validCats.includes(input) ? input : null;

    api.sendMessage('⚔️ جاري جلب حركة الكاتا...', threadID, async (err, info) => {
        fs.ensureDirSync(CACHE_DIR);

        try {
            const { url, cat } = await fetchActionGif(category);
            const buf = await downloadToBuffer(url);

            const ext = url.includes('.gif') ? 'gif' : 'jpg';
            const tmpPath = path.join(CACHE_DIR, `kata_${Date.now()}.${ext}`);
            fs.writeFileSync(tmpPath, buf);

            if (info?.messageID) {
                try { api.unsendMessage(info.messageID); } catch {}
            }

            const stream = new Readable();
            stream.push(buf);
            stream.push(null);
            stream.path = tmpPath;

            const catAr = {
                'hug': 'عناق 🤗', 'kiss': 'قبلة 💋', 'slap': 'صفعة 👋',
                'cuddle': 'احتضان 💕', 'pat': 'تربيت 🫶', 'shoot': 'إطلاق نار 🔫',
                'stab': 'طعنة 🗡️', 'punch': 'لكمة 👊', 'poke': 'نكز 👉', 'bite': 'عض 😤'
            };

            api.sendMessage({
                body: `⚔️ كاتا - ${catAr[cat] || cat}\n🎌 حركة أنمي عشوائية\n💬 جرب: كاتا slap | كاتا hug | كاتا punch`,
                attachment: stream
            }, threadID, () => {
                try { fs.unlinkSync(tmpPath); } catch {}
            }, messageID);

        } catch (e) {
            if (info?.messageID) try { api.unsendMessage(info.messageID); } catch {}
            console.error('[كاتا] خطأ:', e.message);
            api.sendMessage('❌ فشل جلب الصورة، حاول مرة أخرى!', threadID, messageID);
        }
    });
};
