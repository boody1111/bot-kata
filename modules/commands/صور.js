const { getImageStreams } = require('./utils/pinterest');

module.exports.config = {
    name: "صور",
    aliases: ["pin", "pinterest"],
    version: "1.0.0",
    hasPermssion: 0,
    credits: "اربرت اليكسي",
    description: "يبحث عن صور في Pinterest",
    commandCategory: "أدوات",
    usages: "صور [كلمة] - [عدد]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const fullInput = args.join(' ').trim().replace(/\s+/g, ' ');
    const parts = fullInput.split('-');
    const name = (parts[0] || '').trim();
    const number = Math.min(parseInt((parts[1] || '').trim()) || 5, 10);

    if (!name) {
        return api.sendMessage('⚠️ أرسل: صور [كلمة] - [عدد]\nمثال: صور قطط - 5', threadID, messageID);
    }

    try {
        const imgabc = await getImageStreams(name, number);
        if (imgabc.length === 0) {
            return api.sendMessage(`❌ لا توجد صور صالحة لـ "${name}"`, threadID, messageID);
        }

        return api.sendMessage({
            body: `► 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧\n\n${name} - ${imgabc.length}`,
            attachment: imgabc
        }, threadID, () => {}, messageID);
    } catch (e) {
        return api.sendMessage('❌ خطأ في جلب الصور: ' + e.message, threadID, messageID);
    }
};
