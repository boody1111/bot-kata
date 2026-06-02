const fs = require('fs-extra');
const path = require('path');

const GIF_MENU = path.join(process.cwd(), 'assets', 'gifs', 'menu.gif');

module.exports.config = {
    name: "مساعدة",
    aliases: ["help", "هلب", "اوامر", "cmds", "menu", "قائمة"],
    version: "4.0.0",
    hasPermssion: 0,
    credits: "اربرت اليكسي",
    description: "قائمة الأوامر",
    commandCategory: "نظام",
    usages: "مساعدة | مساعدة [اسم الأمر] | مساعدة all",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const TIDdata = global.data.threadData.get(threadID) || {};
    const prefix = TIDdata.PREFIX || global.config?.PREFIX || ".";
    const cmdsMap = global.client.commands;

    const type = (args[0] || '').toLowerCase().trim();

    if (type === 'all') {
        let msg = '━━━━━━━━━━━━━━━━━━━━━━━━\n📋 قائمة جميع الأوامر\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        let i = 0;
        const seen = new Set();
        for (const cmd of cmdsMap.values()) {
            if (!seen.has(cmd.config.name)) {
                seen.add(cmd.config.name);
                msg += `[${++i}] ${cmd.config.name}: ${cmd.config.description || '—'}\n`;
            }
        }
        return api.sendMessage(msg, threadID, messageID);
    }

    if (type) {
        const cmd = cmdsMap.get(type);
        if (!cmd) {
            try {
                const stringSimilarity = require('string-similarity');
                const allNames = [...cmdsMap.keys()];
                const match = stringSimilarity.findBestMatch(type, allNames);
                let msg = `❌ الأمر "${type}" غير موجود.`;
                if (match.bestMatch.rating >= 0.4) msg += `\n💡 ربما تقصد: "${match.bestMatch.target}"`;
                return api.sendMessage(msg, threadID, messageID);
            } catch {
                return api.sendMessage(`❌ الأمر "${type}" غير موجود.`, threadID, messageID);
            }
        }
        const c = cmd.config;
        const permText = c.hasPermssion == 0 ? 'عضو عادي' : c.hasPermssion == 1 ? 'مشرف المجموعة' : c.hasPermssion == 2 ? 'أدمن البوت' : 'مالك البوت';
        return api.sendMessage(
            `╔══════『 معلومات الأمر 』══════╗\n\n` +
            `[🏷️] الاسم: ${c.name} (v${c.version})\n` +
            `[🔐] الصلاحية: ${permText}\n` +
            `[👤] المطور: ${c.credits}\n` +
            `[💬] الوصف: ${c.description}\n` +
            `[🗂️] الفئة: ${c.commandCategory}\n` +
            `[📌] الاستخدام: ${c.usages}\n` +
            `[⏱️] وقت الانتظار: ${c.cooldowns} ثانية\n\n` +
            `╚══════════════════════════╝`,
            threadID, messageID
        );
    }

    const seenNames = new Set();
    const cmds = [];
    cmdsMap.forEach(cmd => {
        const realName = cmd.config.name;
        if (!seenNames.has(realName) && realName !== "مساعدة") {
            seenNames.add(realName);
            cmds.push({ name: realName, desc: cmd.config.description || "—" });
        }
    });

    const emojis = ["🔫","💀","👿","⚔️","🌪","🕸","🥊","🔞","👑","💣","🌑","🎭","🔱","⚡","🐍","🌀","🪖","🔰","🗡️","🧨"];
    let cmdLines = "";
    cmds.forEach((c, i) => {
        const emo = emojis[i % emojis.length];
        cmdLines += `┃  ${emo} [${i + 1}] ${prefix}${c.name}\n┃      ↳ ${c.desc}\n`;
    });

    const msg =
`╔═══════════════════════╗
  بـــــوت 𝕲̷𝑨𝑳𝑰𝑿 ! DΞeviΙBOT
  الحـــربي 𝟐𝟎𝟐𝟔 ⚡
╚═══════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   [👿]  الأوامـر المتاحـة [👿]
┃━━━━━━━━━━━━━━━━━━━━━━━━┃
${cmdLines}┗━━━━━━━━━━━━━━━━━━━━━━━━┛

╭──────────── [👿] ────────────╮
    𝕬𝖑𝖊𝖝𝖎 𝖂𝖆𝖗 𝕭𝖔𝖙 𝟐𝟎𝟐𝟔
  The Ultimate Dark Automation
╰──────────── [⚔️] ────────────╯
انت مجــرد هاربه امامي 🥵🥛

══════════════════════════
𓆩 𝗗𝗮𝗿𝗸 𝗦𝘆𝘀𝘁𝗲𝗺 𝗖𝗼𝗿𝗲 𓆪
لعنة الصمود ⚫
══════════════════════════

╔══════════════════════╗
  تم تطويري بواسطة المطور
     『 اربرت اليكسي 』
       𝘿𝙀𝙑 • 𝙈𝘼𝙎𝙏𝙀𝙍
╚══════════════════════╝

⚡ 𝑮𝒍𝒐𝒓𝒚 𝑻𝒐 𝑻𝒉𝒆 𝑺𝒉𝒂𝒅𝒐𝒘𝒔 ⚡`;

    try {
        const stream = fs.createReadStream(GIF_MENU);
        stream.path = GIF_MENU;
        api.sendMessage({ body: msg, attachment: stream }, threadID, (err, info) => {
            if (err) {
                console.error('[GIF-menu] خطأ:', JSON.stringify(err).slice(0, 200));
                api.sendMessage(msg, threadID);
            } else {
                console.log('[GIF-menu] ✓ أُرسل | ID:', info && info.messageID);
            }
        });
    } catch (e) {
        console.error('[GIF-menu] استثناء:', e.message);
        api.sendMessage(msg, threadID);
    }
};
