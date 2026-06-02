const moment = require('moment-timezone');

module.exports.config = {
    name: "top",
    version: "1.1.1",
    credits: "DC-Nam",
    hasPermssion: 0,
    description: "عرض قائمة أثرى المستخدمين في المجموعة أو السيرفر",
    usages: "[boxmoney|svmoney] + عدد النتائج (افتراضي 10)",
    commandCategory: "مرافق",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
    const { threadID: t, messageID: m, senderID: s, participantIDs: pI } = event;
    let arr = [], newArr = [], msg = "", type = args[0], leng = parseInt(args[1]) - 1 || 9;
    const allType = ["boxmoney", "svmoney"];
    if (!allType.includes(type)) return api.sendMessage(`>>> قائمة الأثرياء <<<
-> top boxmoney : أغنى أعضاء المجموعة
-> top svmoney : أغنى مستخدمي البوت`, t, m);
    if (isNaN(leng) && leng) return api.sendMessage(`➝ عدد النتائج يجب أن يكون رقماً`, t, m);

    switch (type) {
        case "boxmoney": {
            for (const id of pI) {
                let data = await Currencies.getData(id);
                if (!data) continue;
                let money = data.money || 0;
                arr.push({ id: id, money: money });
            }
            arr.sort((a, b) => b.money - a.money);
            newArr = arr.slice(0, leng + 1);
            msg = `=== [ أغنى 10 مستخدمين في المجموعة ] ===
━━━━━━━━━━━━━━━━━━
`;
            for (let i = 0; i < newArr.length; i++) {
                let name = (await Users.getData(newArr[i].id)).name || "";
                msg += `${i < 4 ? ICON(i) : `${i+1}.`} ${name}
→ الرصيد: ${CC(newArr[i].money)}$
`;
            }
            let find = newArr.find(i => i.id == s);
            if (find) msg += TX("money", find.stt, find.money);
            api.sendMessage(msg, t, m);
        }
        break;

        case "svmoney": {
            let get = await Currencies.getAll(['userID', 'money']);
            get.sort((a, b) => b.money - a.money);
            arr = get.slice(0, leng + 1).map((item, index) => ({ stt: index + 1, id: item.userID, money: item.money }));
            msg = `=== [ أغنى 10 مستخدمي البوت ] ===
━━━━━━━━━━━━━━━━━━
`;
            for (let i = 0; i < arr.length; i++) {
                let name = (await Users.getData(arr[i].id)).name || "";
                msg += `${i < 4 ? ICON(i) : `${i+1}.`} ${name}
→ الرصيد: ${CC(arr[i].money)}$
`;
            }
            let find = arr.find(i => i.id == s);
            if (find) msg += TX("money", find.stt, find.money);
            api.sendMessage(msg, t, m);
        }
        break;
    }
};

function CC(n) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function ICON(i) {
    return i == 0 ? "🏆" : i == 1 ? "🥇" : i == 2 ? "🥈" : i == 3 ? "🥉" : "";
}

function TX(tx, i, x) {
    return `━━━━━━━━━━━━━━━━━━\n${i >= 11 ? `→ 𝐁𝐚̣𝐧 𝐝𝐮̛́𝐧𝐠 𝐭𝐡𝐮̛́: ${i}\n➝ ${tx == "money" ? `𝐌𝐎𝐍𝐄𝐘: ${CC(x)}$` : `𝐋𝐞𝐯𝐞𝐥: ${LV(x)}`}` : i >= 1 && i <= 4 ? "→ 𝐁𝐚̣𝐧 𝐡𝐢𝐞̣̂𝐧 𝐝𝐚𝐧𝐠 𝐜𝐨́ 𝐦𝐚̣̆𝐭 𝐭𝐫𝐨𝐧𝐠 𝐓𝐎𝐏" : i == 0 ? "➝ 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐛𝐚̣𝐧 𝐥𝐚̀ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐮̛́𝐧𝐠 𝐓𝐎𝐏 𝐝𝐚̂̀𝐮 " : "→ 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐛𝐚̣𝐧 𝐝𝐚𝐧𝐠 𝐝𝐮̛́𝐧𝐠 𝐭𝐫𝐨𝐧𝐠 𝐓𝐎𝐏 𝟏𝟎"}`;
}
