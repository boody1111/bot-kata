const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "leaveNoti",
    eventType: ["log:unsubscribe"],
    version: "2.0.0",
    credits: "Hitler System",
    description: "إشعار مغادرة الأعضاء"
};

module.exports.run = async function ({ api, event, Users }) {
    const botID = api.getCurrentUserID();
    if (event.logMessageData.leftParticipantFbId == botID) return;

    const adminOnlyThreads = (global.moduleData && global.moduleData.adminOnlyThreads) || {};
    if (adminOnlyThreads[event.threadID]) return;

    const threadID = event.threadID;
    const iduser = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(iduser) || await Users.getNameUser(iduser) || 'مجهول';

    const moment = require('moment-timezone');
    const timeNow = moment.tz('Asia/Riyadh').format('HH:mm:ss ─ DD/MM/YYYY');

    const GIF_LEAVE = path.join(process.cwd(), 'assets', 'gifs', 'leave.gif');

    const leaveMsg =
`╔═══════ ⚠️ ═══════╗
      🚪 مغادرة مفاجئة
╚═══════ ⚠️ ═══════╝

🏃‍♂️ الهارب من الكروب:
【 ${name} 】
توقيت الهروب
[ ${timeNow} ]
💨 قرر ينسحب بهدوء ويختفي في الظلام…
تسجيل هروب يجدعان صوروا👿
━━━━━━━━━━━━━━━━━━━

😢 الكرسي بقى فاضي  
🕯️  ووفرت مكان.لغيرك🤣   

 لو حاب ترجعه  انسي يخنزير👀

━━━━━━━━━━━━━━━━━━━
👋 مع السلامة يا خول`;

    try {
        const stream = fs.createReadStream(GIF_LEAVE);
        stream.path = GIF_LEAVE;
        api.sendMessage({ body: leaveMsg, attachment: stream }, threadID, (err, info) => {
            if (err) {
                console.error('[GIF-leave] خطأ:', JSON.stringify(err).slice(0, 300));
                api.sendMessage(leaveMsg, threadID);
            } else {
                console.log('[GIF-leave] ✓ أُرسل | ID:', info && info.messageID);
            }
        });
    } catch (e) {
        console.error('[GIF-leave] استثناء:', e.message);
        api.sendMessage(leaveMsg, threadID);
    }
};
