const fs = require('fs-extra');
const path = require('path');

const GIF_PATH = path.join(process.cwd(), 'assets', 'gifs', 'developer.gif');

module.exports.config = {
    name: "مطور",
    aliases: ["dev", "developer"],
    version: "2.0.0",
    hasPermssion: 3,
    credits: "اربرت اليكسي",
    description: "معلومات المطور",
    commandCategory: "النظام",
    usages: "مطور",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;

    const msg =
`╔══════════════════════════╗
  𝑲𝑰𝑵𝑮 𝑫𝑬𝑽𝑬𝑳𝑶𝑷𝑬𝑹 ⚔️
╚══════════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👑  𝑨𝑹𝑩𝑬𝑹𝑻  𝑨𝑳𝑬𝑿𝑰  👑  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

⚡ 𝗡𝗔𝗠𝗘  ┆ اربرت اليكسي
🎂 𝗔𝗚𝗘   ┆ 18 عاماً
🌍 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 ┆ 🇸🇾 سوريا
💼 𝗝𝗢𝗕   ┆ راكب العناكب 🕷️

━━━━━━━━━━━━━━━━━━━━━━━━━━

『༴ ☠︎︎ ⋆ 🐞 』

𝐈𝐟 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐟𝐫𝐨𝐦 𝐕𝐀𝐋𝐎𝐑𝐌𝐀
𝐛𝐞 𝐩𝐫𝐨𝐮𝐝 — 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐮𝐧𝐝𝐞𝐫
𝐭𝐡𝐞 𝐩𝐫𝐨𝐭𝐞𝐜𝐭𝐢𝐨𝐧 𝐨𝐟 𝐀𝐫𝐛𝐞𝐫𝐭 💂🏻‍♂️

━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞:
https://www.facebook.com/alfredkotsai.kotsai

━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════════════════════════╗
  ⟬👿⟭ 𝗩𝗮𝗹𝗼𝗿𝗺𝗮 ⟬👿⟭
  𝑲𝑰𝑵𝑮 ┆ 𝑨𝑳𝑰𝑿 ┆ 𝟐𝟎𝟐𝟔
╚══════════════════════════╝

⚡ 𝑮𝒍𝒐𝒓𝒚 𝑻𝒐 𝑻𝒉𝒆 𝑺𝒉𝒂𝒅𝒐𝒘𝒔 ⚡`;

    try {
        const stream = fs.createReadStream(GIF_PATH);
        stream.path = GIF_PATH;
        api.sendMessage({ body: msg, attachment: stream }, threadID, (err, info) => {
            if (err) {
                console.error('[GIF-مطور] خطأ:', JSON.stringify(err).slice(0, 200));
                api.sendMessage(msg, threadID, (e) => {}, messageID);
            } else {
                console.log('[GIF-مطور] ✓ أُرسل | ID:', info && info.messageID);
            }
        }, messageID);
    } catch (e) {
        console.error('[GIF-مطور] استثناء:', e.message);
        api.sendMessage(msg, threadID, (err) => {}, messageID);
    }
};
