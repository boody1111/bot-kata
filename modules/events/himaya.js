const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { Readable } = require('stream');

module.exports.config = {
    name: "himayaEvent",
    eventType: ["log:thread-name", "log:thread-image", "log:user-nickname"],
    version: "1.0.0",
    credits: "اربرت اليكسي",
    description: "حماية الكروب من التغييرات غير المصرح بها"
};

module.exports.run = async function ({ api, event }) {
    const { threadID, logMessageType, logMessageData } = event;

    if (!global.moduleData) return;
    if (!global.moduleData.himayaActive) return;
    if (!global.moduleData.himayaActive[threadID]) return;

    const saved = (global.moduleData.himayaSaved || {})[threadID];
    if (!saved) return;

    try {
        if (logMessageType === 'log:thread-name') {
            const newName = logMessageData && logMessageData.name;
            if (saved.groupName && newName !== saved.groupName) {
                try {
                    await api.setTitle(saved.groupName, threadID);
                    api.sendMessage(`🛡️ تم رد الاسم | تغيير اسم الكروب غير مسموح!\nالاسم الأصلي: ${saved.groupName}`, threadID);
                } catch (e) {
                    console.error('[حماية] فشل استعادة اسم الكروب:', e.message);
                }
            }
        }

        if (logMessageType === 'log:thread-image') {
            if (saved.groupImage) {
                try {
                    const res = await axios.get(saved.groupImage, { responseType: 'arraybuffer', timeout: 15000 });
                    const buf = Buffer.from(res.data);
                    const s = new Readable();
                    s.push(buf);
                    s.push(null);
                    s.path = 'group.jpg';
                    await api.changeGroupImage(s, threadID);
                    api.sendMessage('🛡️ تم رد الصورة | تغيير صورة الكروب غير مسموح!', threadID);
                } catch (e) {
                    console.error('[حماية] فشل استعادة صورة الكروب:', e.message);
                }
            }
        }

        if (logMessageType === 'log:user-nickname') {
            const changedID = String(logMessageData && logMessageData.participant_id);
            if (String(changedID) === String(saved.botID) && saved.botNick) {
                try {
                    await api.changeNickname(saved.botNick, threadID, saved.botID);
                    api.sendMessage(`🛡️ تم رد الكنية | تغيير كنية البوت غير مسموح!`, threadID);
                } catch {}
            }
            if (String(changedID) === String(saved.adminID) && saved.devNick) {
                try {
                    await api.changeNickname(saved.devNick, threadID, saved.adminID);
                    api.sendMessage(`🛡️ تم رد الكنية | تغيير كنية المطور غير مسموح!`, threadID);
                } catch {}
            }
        }
    } catch (e) {
        console.error('[حماية Event] خطأ:', e.message);
    }
};
