const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { Readable } = require('stream');

module.exports.config = {
    name: "تخيل",
    aliases: ["imagine", "aigimg", "رسم"],
    version: "5.0.0",
    hasPermssion: 0,
    credits: "Hitler System",
    description: "توليد صورة بالذكاء الاصطناعي",
    commandCategory: "ذكاء اصطناعي",
    usages: ".تخيل [وصف ما تريد رؤيته]",
    cooldowns: 15
};

const CACHE_DIR = path.join(__dirname, 'cache', 'img');

async function tryDownload(url, filePath) {
    const res = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        timeout: 120000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124',
            'Accept': '*/*',
            'Cache-Control': 'no-cache'
        },
        maxRedirects: 15,
        validateStatus: s => s >= 200 && s < 400
    });

    const ct = String(res.headers['content-type'] || '');
    if (ct.includes('text/html') || ct.includes('application/json')) {
        throw new Error('returned_html_or_json');
    }

    const buf = Buffer.from(res.data);
    if (buf.length < 1024) throw new Error('image_too_small: ' + buf.length + ' bytes');

    fs.writeFileSync(filePath, buf);
    return buf.length;
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(' ').trim();

    if (!prompt) {
        return api.sendMessage(
            '🎨 اكتب وصفاً لما تريد رسمه\nمثال: .تخيل غروب الشمس على البحر\nأو: .تخيل sunset over ocean',
            threadID, messageID
        );
    }

    const seed = Math.floor(Math.random() * 9999999);
    const enc = encodeURIComponent(prompt);
    const encHQ = encodeURIComponent(prompt + ', ultra detailed, 4k, masterpiece');

    const providers = [
        `https://image.pollinations.ai/prompt/${encHQ}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`,
        `https://image.pollinations.ai/prompt/${enc}?width=768&height=768&nologo=true&seed=${seed}&model=flux-realism`,
        `https://image.pollinations.ai/prompt/${enc}?width=1024&height=1024&seed=${seed + 1}&model=flux&nologo=true`,
        `https://image.pollinations.ai/prompt/${enc}?width=512&height=512&nologo=true&seed=${seed + 2}&model=turbo`,
        `https://image.pollinations.ai/prompt/${encHQ}?width=768&height=768&nologo=true&seed=${seed + 3}`,
    ];

    api.sendMessage(`🎨 جاري رسم: "${prompt}"\n⏳ انتظر دقيقة...`, threadID, async (err, info) => {
        fs.ensureDirSync(CACHE_DIR);
        const filePath = path.join(CACHE_DIR, `imagine_${Date.now()}.jpg`);
        let success = false;
        let lastError = '';

        for (let i = 0; i < providers.length; i++) {
            try {
                console.log(`[تخيل] محاولة ${i + 1}/${providers.length}`);
                const size = await tryDownload(providers[i], filePath);
                console.log(`[تخيل] ✓ نجح - حجم: ${(size / 1024).toFixed(0)}KB`);
                success = true;
                break;
            } catch (e) {
                lastError = e.message;
                console.error(`[تخيل] ✗ فشل ${i + 1}: ${e.message}`);
                if (i < providers.length - 1) {
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
        }

        if (info?.messageID) {
            try { api.unsendMessage(info.messageID); } catch {}
        }

        if (!success || !fs.existsSync(filePath)) {
            console.error('[تخيل] فشل كل المحاولات، آخر خطأ:', lastError);
            return api.sendMessage(
                `❌ تعذّر توليد الصورة الآن\n💡 جرب:\n• وصفاً بالإنجليزية: .تخيل mountain lake sunset\n• وصفاً أبسط وأقصر`,
                threadID, messageID
            );
        }

        try {
            const stat = fs.statSync(filePath);
            const stream = fs.createReadStream(filePath);

            api.sendMessage({
                body: `🎨 "${prompt}"\n⚡ Flux AI`,
                attachment: stream
            }, threadID, () => {
                try { fs.unlinkSync(filePath); } catch {}
            }, messageID);
        } catch (e) {
            console.error('[تخيل] خطأ في الإرسال:', e.message);
            api.sendMessage('❌ حدث خطأ أثناء إرسال الصورة', threadID, messageID);
        }
    });
};
