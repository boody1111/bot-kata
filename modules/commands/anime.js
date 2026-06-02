const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { Readable } = require('stream');

module.exports.config = {
    name: "anime",
    aliases: ["انمي", "waifu", "وايفو"],
    version: "2.0.0",
    hasPermssion: 0,
    credits: "اربرت اليكسي",
    description: "يرسل صور أنمي عشوائية",
    commandCategory: "صور عشوائية",
    usages: "anime [نوع: waifu/neko/maid]",
    cooldowns: 10
};

const CATEGORIES = ['waifu', 'neko', 'maid', 'shinobu', 'megumin', 'cuddle', 'hug', 'kiss', 'pat'];

const CACHE_DIR = path.join(__dirname, 'cache', 'img');

async function fetchAnimeImage(category) {
    const cat = category || CATEGORIES[Math.floor(Math.random() * 4)];
    const res = await axios.get(`https://api.waifu.pics/sfw/${cat}`, { timeout: 15000 });
    return res.data.url;
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
    const catMap = { 'neko': 'neko', 'maid': 'maid', 'waifu': 'waifu', 'shinobu': 'shinobu', 'megumin': 'megumin' };
    const category = catMap[input] || null;

    api.sendMessage('🌸 جاري جلب صور الأنمي...', threadID, async (err, info) => {
        fs.ensureDirSync(CACHE_DIR);

        const count = 3;
        const attachments = [];
        const tempFiles = [];

        try {
            const urls = await Promise.all(Array(count).fill(0).map(() => fetchAnimeImage(category)));

            for (let i = 0; i < urls.length; i++) {
                try {
                    const buf = await downloadToBuffer(urls[i]);
                    const ext = urls[i].includes('.gif') ? 'gif' : 'jpg';
                    const tmpPath = path.join(CACHE_DIR, `anime_${Date.now()}_${i}.${ext}`);
                    fs.writeFileSync(tmpPath, buf);
                    tempFiles.push(tmpPath);

                    const stream = new Readable();
                    stream.push(buf);
                    stream.push(null);
                    stream.path = tmpPath;
                    attachments.push(stream);
                } catch {}
            }

            if (info?.messageID) {
                try { api.unsendMessage(info.messageID); } catch {}
            }

            if (attachments.length === 0) {
                return api.sendMessage('❌ فشل جلب الصور، حاول مرة أخرى!', threadID, messageID);
            }

            const catNames = {
                'waifu': 'وايفو', 'neko': 'نيكو', 'maid': 'خادمة',
                'shinobu': 'شينوبو', 'megumin': 'ميغومين'
            };
            const displayCat = catNames[category || 'waifu'] || 'أنمي';

            api.sendMessage({
                body: `🌸 صور ${displayCat} عشوائية ✨\n🗂️ الفئة: ${category || 'عشوائي'}\n💬 الأوامر: anime waifu | anime neko | anime maid`,
                attachment: attachments
            }, threadID, () => {
                for (const f of tempFiles) try { fs.unlinkSync(f); } catch {}
            }, messageID);

        } catch (e) {
            if (info?.messageID) try { api.unsendMessage(info.messageID); } catch {}
            console.error('[anime] خطأ:', e.message);
            api.sendMessage('❌ خطأ في جلب الصور: ' + e.message, threadID, messageID);
        }
    });
};
