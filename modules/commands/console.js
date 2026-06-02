module.exports.config = {
    name: "console",
    version: "2.0.0",
    hasPermssion: 3,
    credits: "Hitler System",
    description: "عرض سجلات الرسائل في الكونسول",
    commandCategory: "النظام",
    usages: "console",
    cooldowns: 0
};

module.exports.handleEvent = async function ({ api, Users, event }) {
    const chalk = require('chalk');
    const moment = require("moment-timezone");

    const thread = global.data.threadData.get(event.threadID) || {};
    if (typeof thread["console"] !== "undefined" && thread["console"] == true) return;
    if (event.senderID == global.data.botID) return;

    const time = moment.tz("Asia/Riyadh").format("HH:mm:ss | DD/MM/YYYY");
    const nameBox = global.data.threadInfo.get(event.threadID)?.threadName || "مجموعة غير معروفة";
    const nameUser = await Users.getNameUser(event.senderID);
    const msg = event.body || "[ صورة / فيديو / مرفق ]";

    const colors = ["FF9900","FFFF33","33FFFF","FF99FF","FF3366","FF00FF","66FF99","00CCFF","FF0099","7900FF","93FFD8","47B5FF","42C2FF","FF7396"];
    const r = () => colors[Math.floor(Math.random() * colors.length)];

    console.log(
        chalk.hex("#" + r())(`[📌] المجموعة : ${nameBox}`) + "\n" +
        chalk.hex("#" + r())(`[🆔] ID المجموعة : ${event.threadID}`) + "\n" +
        chalk.hex("#" + r())(`[👤] المستخدم : ${nameUser}`) + "\n" +
        chalk.hex("#" + r())(`[🆔] ID المستخدم : ${event.senderID}`) + "\n" +
        chalk.hex("#" + r())(`[💬] الرسالة : ${msg}`) + "\n" +
        chalk.hex("#" + r())(`[ ${time} ]`) + "\n" +
        chalk.hex("#" + r())(`◆━━━━━━━━━◆ 𝑨𝑳𝑰𝑿 𝑩𝑶𝑻 ◆━━━━━━━━━◆\n`)
    );
};

module.exports.run = async function () {};
