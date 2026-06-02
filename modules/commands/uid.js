module.exports.config = {
    name: "uid",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "TatsuYTB",
    description: "عرض معرف المستخدم (UID)",
    commandCategory: "مرافق",
    cooldowns: 5,
    prefix: "",
};

module.exports.handleEvent = async ({ api, event, Users }) => {
    const { threadID, messageID, body, mentions, senderID, messageReply } = event;
    if (typeof body !== "string") return;
    if (body.startsWith("uid")) {
        let uid;
        if (event.type == "message_reply") {
            uid = messageReply.senderID;
        } else if (body.indexOf('@') !== -1) {
            uid = Object.keys(mentions || {})[0];
        } else {
            uid = senderID;
        }
        const name = await Users.getNameUser(uid);
        api.sendMessage(uid, threadID, messageID);
    }
};

module.exports.run = async ({ api, event, Users, args }) => {
    const { threadID, messageID, mentions, senderID, messageReply } = event;
    let uid;
    if (event.type == "message_reply") {
        uid = messageReply.senderID;
    } else if (args.join().indexOf('@') !== -1) {
        uid = Object.keys(mentions || {})[0];
    } else {
        uid = senderID;
    }
    const name = await Users.getNameUser(uid);
    return api.sendMessage(uid, threadID, messageID);
};
