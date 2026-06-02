const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "اذاعة",
    aliases: ["broadcast", "بث"],
    version: "2.0.0",
    hasPermssion: 3,
    credits: "اربرت اليكسي",
    description: "يبث رسالة لجميع المجموعات أو مجموعات محددة",
    commandCategory: "المطور",
    usages: "اذاعة [رسالة] | اذاعة ← ثم أرسل الرسالة رداً",
    cooldowns: 5
};

async function doBroadcast(api, message, targetThreads, reportThreadID) {
    let sent = 0, failed = 0;
    await api.sendMessage(`📡 جاري الإذاعة لـ ${targetThreads.length} مجموعة...`, reportThreadID);

    for (const tid of targetThreads) {
        try {
            await new Promise((resolve, reject) => {
                api.sendMessage(message, tid, (err) => err ? reject(err) : resolve());
            });
            sent++;
        } catch { failed++; }
        await new Promise(r => setTimeout(r, 600));
    }

    api.sendMessage(
        `✅ انتهت الإذاعة!\n📤 تم الإرسال: ${sent}\n❌ فشل: ${failed}`,
        reportThreadID
    );
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // اذاعة [رسالة مباشرة]
    if (args.length > 0) {
        const message = args.join(' ').trim();
        const allThreads = global.data?.allThreadID || [];
        if (allThreads.length === 0) {
            return api.sendMessage('⚠️ لا توجد مجموعات مسجلة.', threadID, messageID);
        }
        await doBroadcast(api, message, allThreads, threadID);
        return;
    }

    // اذاعة بدون args — اطلب الرسالة عبر reply
    api.sendMessage(
        '📢 أرسل الرسالة التي تريد إذاعتها:\n\n' +
        '• رد على هذه الرسالة بالرسالة المطلوبة\n' +
        '• أو اكتب: اذاعة [رسالتك] مباشرة\n\n' +
        'لإذاعة لكروبات محددة: أرسل أولاً الرسالة ثم في سطر جديد:\nكروبات:\n[ID1]\n[ID2]',
        threadID,
        (err, info) => {
            if (!err && info) {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: senderID,
                    reportThreadID: threadID,
                    type: 'awaitMessage'
                });
            }
        },
        messageID
    );
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { senderID, body, threadID, messageID } = event;

    if (handleReply.type !== 'awaitMessage') return;
    if (senderID !== handleReply.author) return;

    // إزالة من القائمة
    const idx = global.client.handleReply.findIndex(r => r.messageID === handleReply.messageID);
    if (idx !== -1) global.client.handleReply.splice(idx, 1);

    if (!body || !body.trim()) {
        return api.sendMessage('⚠️ الرسالة فارغة، لم تُرسَل الإذاعة.', threadID, messageID);
    }

    // تحقق إذا كان هناك كروبات محددة
    const lines = body.trim().split('\n');
    let message = body.trim();
    let targetThreads = global.data?.allThreadID || [];

    const kIdx = lines.findIndex(l => l.trim().startsWith('كروبات:') || l.trim() === 'كروبات');
    if (kIdx !== -1) {
        message = lines.slice(0, kIdx).join('\n').trim();
        const specifiedIDs = lines.slice(kIdx + 1).map(l => l.trim()).filter(l => /^\d+$/.test(l));
        if (specifiedIDs.length > 0) targetThreads = specifiedIDs;
    }

    if (!message) {
        return api.sendMessage('⚠️ لم يُعثر على رسالة صالحة.', threadID, messageID);
    }

    await doBroadcast(api, message, targetThreads, handleReply.reportThreadID || threadID);
};
