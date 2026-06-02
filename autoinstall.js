const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FLAG = path.join(__dirname, '.packages_installed');
const NM = path.join(__dirname, 'node_modules');

if (fs.existsSync(FLAG)) {
    return;
}

if (fs.existsSync(NM) && fs.readdirSync(NM).length > 50) {
    fs.writeFileSync(FLAG, new Date().toISOString(), 'utf8');
    return;
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('[ تثبيت ] أول تشغيل - جاري تثبيت المكاتب...');
console.log('[ تثبيت ] قد يستغرق 2-5 دقائق، انتظر...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

try {
    const result = spawnSync(
        npmCmd,
        ['install', '--no-audit', '--no-fund', '--legacy-peer-deps', '--prefer-offline'],
        {
            cwd: __dirname,
            stdio: 'inherit',
            shell: true,
            timeout: 600000
        }
    );

    if (result.status === 0) {
        fs.writeFileSync(FLAG, new Date().toISOString(), 'utf8');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[ تثبيت ] ✅ تم تثبيت جميع المكاتب بنجاح!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
        console.error('[ تثبيت ] ❌ فشل التثبيت - إعادة المحاولة بدون cache...');
        const result2 = spawnSync(
            npmCmd,
            ['install', '--no-audit', '--no-fund', '--legacy-peer-deps'],
            {
                cwd: __dirname,
                stdio: 'inherit',
                shell: true,
                timeout: 600000
            }
        );
        if (result2.status === 0) {
            fs.writeFileSync(FLAG, new Date().toISOString(), 'utf8');
            console.log('[ تثبيت ] ✅ تم التثبيت بنجاح في المحاولة الثانية!');
        } else {
            console.error('[ تثبيت ] ❌ فشل التثبيت نهائياً');
            console.error('[ تثبيت ] شغل يدوياً: npm install --legacy-peer-deps');
            process.exit(1);
        }
    }
} catch (e) {
    console.error('[ تثبيت ] خطأ:', e.message);
    process.exit(1);
}
