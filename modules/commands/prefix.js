module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "tpk",
  description: "Xem prefix của BOT",
  commandCategory: "مرافق",
  usages: "",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ event, api, Threads }) => {
  var os = require("os");
  var cpus = os.cpus();
  var chips;
  for (var i of cpus) chips = i.model, speed = i.speed;
  if (cpus == undefined);
  var { threadID, messageID, body, senderID } = event;
  //if (senderID == global.data.botID) return;
  if ((this.config.credits) != "tpk") { return api.sendMessage(`Sai credits!`, threadID, messageID)}
  function out(data) {
    api.sendMessage(data, threadID, messageID)
  }
  var dataThread = (await Threads.getData(threadID));
  var data = dataThread.data; 
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};

  var arr = ["mpre","mprefix","prefix", "dấu lệnh", "prefix của bot là gì","daulenh", "dùng sao"];
  arr.forEach(i => {
    let str = i[0].toUpperCase() + i.slice(1);
    if (body === i.toUpperCase() | body === i | str === body) {
    const prefix = threadSetting.PREFIX || global.config.PREFIX;
      if (data.PREFIX == null) {
        return out(`====『 𝗣𝗥𝗘𝗙𝗜𝗫 』====\n━━━━━━━━━━━━━━━━\n[ ${prefix} ] 𝗡𝗵𝗼́𝗺 𝗰𝗵𝘂̛𝗮 𝘅𝗲́𝘁 𝗽𝗿𝗲𝗳𝗶𝘅 𝗺𝗼̛́𝗶 𝗰𝗵𝗼 𝗯𝗼𝘁\n\n🌸 𝗖𝗼́ 𝘁𝗵𝗲̂̉ 𝗱𝘂̀𝗻𝗴 𝘀𝗲𝘁𝗽𝗿𝗲𝗳𝗶𝘅 + 𝗽𝗿𝗲𝗳𝗶𝘅 𝗯𝗮̣𝗻 𝗺𝘂𝗼̂́𝗻 𝘀𝗲𝘁 𝘀𝗲𝘁𝗽𝗿𝗲𝗳𝗶𝘅 𝗿𝗲𝘀𝗲𝘁 𝗻𝗲̂́𝘂 𝗺𝘂𝗼̂́𝗻 𝘃𝗲̂̀ 𝗽𝗿𝗲𝗳𝗶𝘅 𝗰𝘂̃`)
      }
      else return out('====『 𝗣𝗥𝗘𝗙𝗜𝗫 』====\n━━━━━━━━━━━━━━━━\n→ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗵𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝗰𝘂̉𝗮 𝗻𝗵𝗼́𝗺: ' + data.PREFIX + '\n→ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗺𝗮̣̆𝗰 đ𝗶̣𝗻𝗵 𝘁𝗿𝗲̂𝗻 𝗵𝗲̣̂ 𝘁𝗵𝗼̂́𝗻𝗴 𝗯𝗼𝘁: ' + prefix + `\n\n🌸 𝗖𝗼́ 𝘁𝗵𝗲̂̉ 𝗱𝘂̀𝗻𝗴 𝘀𝗲𝘁𝗽𝗿𝗲𝗳𝗶𝘅 + 𝗽𝗿𝗲𝗳𝗶𝘅 𝗯𝗮̣𝗻 𝗺𝘂𝗼̂́𝗻 𝘀𝗲𝘁 𝘀𝗲𝘁𝗽𝗿𝗲𝗳𝗶𝘅 𝗿𝗲𝘀𝗲𝘁 𝗻𝗲̂́𝘂 𝗺𝘂𝗼̂́𝗻 𝘃𝗲̂̀ 𝗽𝗿𝗲𝗳𝗶𝘅 𝗰𝘂̃`)
    }

  });
};

module.exports.run = async({ event, api }) => {
    return api.sendMessage("😼", event.threadID)
}