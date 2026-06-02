/**
 * سكريبت التثبيت الكامل - يثبت جميع المكتبات المطلوبة دفعة واحدة
 * شغّله بـ: node install.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════');
console.log('   📦 تثبيت مكتبات البوت - Hitler Bot');
console.log('═══════════════════════════════════════\n');

// المكتبات الرئيسية من package.json
const mainPackages = JSON.parse(fs.readFileSync('./package.json', 'utf8')).dependencies || {};

// المكتبات الإضافية المستخدمة داخل الأوامر
const extraPackages = [
    'fs-extra',
    'axios',
    'moment-timezone',
    'string-similarity',
    'request',
    'canvas',
    'jimp',
    'node-fetch',
    'sequelize',
    'sqlite3',
    'cheerio',
    'express',
    'socket.io',
    'fluent-ffmpeg',
    'totp-generator',
    'youtube-dl-exec',
    'gtts',
];

function install(pkgs, cwd, label) {
    const list = Object.keys(pkgs).join(' ');
    if (!list.trim()) return;
    console.log(`\n📥 تثبيت ${label}...`);
    try {
        execSync(`npm install --save ${list}`, {
            stdio: 'inherit',
            cwd: cwd,
            shell: true
        });
        console.log(`✅ تم تثبيت ${label} بنجاح`);
    } catch (e) {
        console.log(`⚠️ خطأ في تثبيت بعض مكتبات ${label}`);
    }
}

// تثبيت المكتبات الرئيسية
install(mainPackages, __dirname, 'المكتبات الرئيسية');

// تثبيت المكتبات الإضافية في مجلد nodemodules
const extraObj = {};
extraPackages.forEach(p => extraObj[p] = '');

const nodeModulesDir = path.join(__dirname, 'nodemodules');
if (!fs.existsSync(nodeModulesDir)) fs.mkdirSync(nodeModulesDir, { recursive: true });
if (!fs.existsSync(path.join(nodeModulesDir, 'package.json'))) {
    fs.writeFileSync(path.join(nodeModulesDir, 'package.json'), JSON.stringify({ name: "nodemodules", version: "1.0.0" }, null, 2));
}

install(extraObj, nodeModulesDir, 'المكتبات الإضافية');

console.log('\n═══════════════════════════════════════');
console.log('✅ اكتمل التثبيت! البوت جاهز للتشغيل');
console.log('   شغّل البوت بـ: npm start');
console.log('═══════════════════════════════════════');
