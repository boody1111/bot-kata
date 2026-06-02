module.exports.config = {
  name: "echo",
  version: "1.0.0", 
  hasPermssion: 3,
  credits: "DungUwU",
  description: "إرسال رسالة محددة", 
  commandCategory: "النظام", 
  usages: "", 
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    return api.sendMessage(args.join(" "), event.threadID);
}