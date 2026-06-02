const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "2.0.0",
    credits: "Hitler System",
    description: "إشعار انضمام أعضاء أو إضافة البوت"
};

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, logMessageData } = event;
    const botID = api.getCurrentUserID();
    const botAdded = logMessageData.addedParticipants.some(p => p.userFbId == botID);

    const adminOnlyThreads = (global.moduleData && global.moduleData.adminOnlyThreads) || {};
    if (adminOnlyThreads[threadID] && !botAdded) return;

    const GIF_BOT  = path.join(process.cwd(), 'assets', 'gifs', 'bot_added.gif');
    const GIF_JOIN = path.join(process.cwd(), 'assets', 'gifs', 'join_member.gif');

    if (botAdded) {
        await api.changeNickname('𝑨𝑳𝑰𝑿៹㊑BOT𓃙𓃚', threadID, botID);

        const botMsg =
`╔═══════ 🤖 ═══════╗
     تم تشغيل البوت بنجاح
╚═══════ 🤖 ═══════╝

⚡ أهلاً بكم! في بوت الفوز بالحروب  تخريب وتسليه.

🤖 اسم البوت:
【 اليكسي الحربي 2026 】

🛠 المطور:
【 اربرت ساما 】

━━━━━━━━━━━━━━━━━━━

📌 تم إضافتي إلى هذا الكروب بنجاح  
سأبدأ الآن في إدارة النظام وتفعيل الأوامر.

✨ الأوامر جاهزة للاستخدام  
💬 اكتب ( menu ) لمعرفة كل الأوامر

━━━━━━━━━━━━━━━━━━━
🚀 جاهزون لركوب الاعداء يحب`;

        try {
            const stream = fs.createReadStream(GIF_BOT);
            stream.path = GIF_BOT;
            api.sendMessage({ body: botMsg, attachment: stream }, threadID, (err, info) => {
                if (err) {
                    console.error('[GIF-bot_added] خطأ:', JSON.stringify(err).slice(0, 300));
                    api.sendMessage(botMsg, threadID);
                } else {
                    console.log('[GIF-bot_added] ✓ أُرسل | ID:', info && info.messageID);
                }
            });
        } catch (e) {
            console.error('[GIF-bot_added] استثناء:', e.message);
            api.sendMessage(botMsg, threadID);
        }
        return;
    }

    const nameArray = [];
    const mentions = [];

    for (const p of logMessageData.addedParticipants) {
        if (p.userFbId == botID) continue;
        const userName = p.fullName;
        nameArray.push(userName);
        mentions.push({ tag: userName, id: p.userFbId });

        if (!global.data.allUserID.includes(p.userFbId)) {
            await Users.createData(p.userFbId, { name: userName, data: {} });
            global.data.userName.set(p.userFbId, userName);
            global.data.allUserID.push(p.userFbId);
        }
    }

    if (nameArray.length === 0) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const authorData = event.author ? await Users.getData(event.author) : null;
    const authorName = authorData?.name || "رابط الانضمام";

    const moment = require('moment-timezone');
    const timeNow = moment.tz('Asia/Riyadh').format('HH:mm:ss ─ DD/MM/YYYY');

    const welcomeMsg =
`╔═══════ 👋 ═══════╗
       أهلاً بالعضو الجديد
╚═══════ 👋 ═══════╝

🌟 مرحباً بـ: ${nameArray.join('، ')}
في كروب: 【 ${threadInfo.threadName} 】

👥 عدد الأعضاء الآن: ${threadInfo.participantIDs.length}
➕ تمت الإضافة بواسطة: ${authorName}
🕐 وقت الانضمام: ${timeNow}

━━━━━━━━━━━━━━━━━━━
💬 أهلاً وسهلاً بيننا، نحن سعداء بوجودك 🎉
استمتع وكن جزءاً من المعركة ⚔️
━━━━━━━━━━━━━━━━━━━`;

    try {
        const stream = fs.createReadStream(GIF_JOIN);
        stream.path = GIF_JOIN;
        api.sendMessage({ body: welcomeMsg, mentions, attachment: stream }, threadID, (err, info) => {
            if (err) {
                console.error('[GIF-join_member] خطأ:', JSON.stringify(err).slice(0, 300));
                api.sendMessage({ body: welcomeMsg, mentions }, threadID);
            } else {
                console.log('[GIF-join_member] ✓ أُرسل | ID:', info && info.messageID);
            }
        });
    } catch (e) {
        console.error('[GIF-join_member] استثناء:', e.message);
        api.sendMessage({ body: welcomeMsg, mentions }, threadID);
    }
};
