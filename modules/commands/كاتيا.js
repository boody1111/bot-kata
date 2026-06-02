module.exports.config = {
    name: "كاتيا",
    aliases: ["groups", "كروبات"],
    version: "3.0.0",
    hasPermssion: 3,
    credits: "اربرت اليكسي",
    description: "يعرض جميع المجموعات التي البوت فيها مع خيار المغادرة",
    commandCategory: "المطور",
    usages: "كاتيا",
    cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    const allThreads = (global.data?.allThreadID || []).filter(id => id !== threadID);

    if (allThreads.length === 0) {
        return api.sendMessage('⚠️ البوت ليس في أي مجموعة أخرى حالياً.', threadID, messageID);
    }

    let list = `╔═══════════════════════╗\n`;
    list += `  📋 قائمة المجموعات (${allThreads.length})\n`;
    list += `╚═══════════════════════╝\n\n`;

    // نجلب المعلومات بشكل متسلسل مع timeout لكل طلب
    for (let i = 0; i < allThreads.length; i++) {
        const tid = allThreads[i];
        let name = 'غير معروف';
        let count = '?';

        try {
            // نحاول من الكاش أولاً
            const cached = global.data?.threadInfo?.get(tid);
            if (cached && cached.threadName) {
                name = cached.threadName || 'بدون اسم';
                count = (cached.participantIDs || []).length;
            } else {
                const info = await Promise.race([
                    new Promise((resolve, reject) => {
                        api.getThreadInfo(tid, (err, data) => err ? reject(err) : resolve(data));
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                ]);
                if (info) {
                    name = info.threadName || 'بدون اسم';
                    count = (info.participantIDs || []).length;
                }
            }
        } catch {}

        list += `[${i + 1}] 📌 ${name}\n    🆔 ${tid}\n    👥 ${count} عضو\n\n`;

        // استراحة صغيرة كل 10 كروبات لتجنب الحظر
        if (i > 0 && i % 10 === 0) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    list += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    list += `للخروج: رد على هذه الرسالة بـ:\nاخرج [ID الكروب]`;

    api.sendMessage(list, threadID, (err, info) => {
        if (err || !info?.messageID) return;
        global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            type: 'katyaLeave'
        });
    }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { senderID, body, threadID, messageID } = event;

    if (handleReply.type !== 'katyaLeave') return;
    if (handleReply.author && senderID !== handleReply.author) return;

    const adminbot = global.config?.ADMINBOT || [];
    const ndh = global.config?.NDH || [];
    if (!adminbot.includes(String(senderID)) && !ndh.includes(String(senderID))) {
        return api.sendMessage('⛔ هذا الأمر للمطور فقط!', threadID, messageID);
    }

    const trimmed = (body || '').trim();
    if (!trimmed.toLowerCase().startsWith('اخرج') && !trimmed.startsWith('خرج')) return;

    const targetTID = trimmed.replace(/^(اخرج|خرج)\s*/, '').trim();
    if (!targetTID || !/^\d+$/.test(targetTID)) {
        return api.sendMessage('⚠️ الصيغة: اخرج [ID المجموعة]', threadID, messageID);
    }

    // حذف من قائمة handleReply
    const idx = global.client.handleReply.findIndex(r => r.messageID === handleReply.messageID);
    if (idx !== -1) global.client.handleReply.splice(idx, 1);

    try {
        await new Promise((resolve) => {
            api.sendMessage(
                `『 𝑲𝑰𝑵𝑮 𝑨𝑳𝑰𝑿 』يغادر الآن...\n⚡ شكراً لاستضافتكم`,
                targetTID,
                () => resolve()
            );
        });
    } catch {}

    setTimeout(async () => {
        try {
            const botID = api.getCurrentUserID();
            await new Promise((resolve, reject) => {
                api.removeUserFromGroup(botID, targetTID, err => err ? reject(err) : resolve());
            });
            api.sendMessage(`✅ تم الخروج من المجموعة\n🆔 ${targetTID}`, threadID, messageID);
        } catch (e) {
            api.sendMessage(`❌ فشل الخروج: ${e.message}`, threadID, messageID);
        }
    }, 1500);
};
