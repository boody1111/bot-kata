module.exports.config = {
    name: "pin",
    version: "0.0.1",
    hasPermssion: 0,
    credits: "meow",
    description: "Pinterest",
    commandCategory: "مرافق",
    usages: "pin text - number",
    cooldowns: 0
  };
  module.exports.run = async function({ api, event, args }) {
      const { getImageStreams } = require('./utils/pinterest');
      const input = args.join(" ").trim().replace(/\s+/g, " ");
      const name = input.split("-")[0].trim();
      const number = Math.min(parseInt(input.split("-")[1]) || 6, 10);
      if (!name) return api.sendMessage("⚠️ أرسل: pin cats - 5", event.threadID, event.messageID);
      try {
        const imgabc = await getImageStreams(name, number);
        if (!imgabc.length) return api.sendMessage("❌ لم أجد صور صالحة", event.threadID, event.messageID);
        return api.sendMessage({
          body: `► 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧\n\n${name} - ${imgabc.length}`,
          attachment: imgabc
        }, event.threadID, () => {}, event.messageID);
      } catch (e) {
        return api.sendMessage("❌ خطأ في جلب الصور: " + e.message, event.threadID, event.messageID);
      }
        }