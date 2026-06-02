require('./autoinstall');
const { spawn, execSync } = require("child_process");
const { readFileSync, existsSync, readdirSync, unlinkSync, statSync, mkdirSync, writeFileSync } = require("fs-extra");
const fsExtra = require("fs-extra");
const axios = require("axios");
const logger = require("./utils/log");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const moment = require("moment-timezone");
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'hitler2026';
const ROOT = __dirname;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   حالة البوت
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let botProcess = null;
let botStatus = 'stopped';
let botStartTime = null;
let botLogs = [];
const MAX_LOGS = 300;

function addLog(msg) {
    const ts = moment.tz("Asia/Riyadh").format("HH:mm:ss");
    botLogs.push(`[${ts}] ${msg}`);
    if (botLogs.length > MAX_LOGS) botLogs.shift();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   التنظيف التلقائي عند التشغيل
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function autoCleanup() {
    const EXT = ['.jpg', '.jpeg', '.png', '.mp3', '.mp4', '.wav', '.ogg', '.webm', '.tmp'];
    const DIRS = [
        path.join(ROOT, 'tmp'),
        path.join(ROOT, 'temp'),
        path.join(ROOT, 'modules', 'commands', 'cache', 'tmp'),
        path.join(ROOT, 'modules', 'commands', 'cache', 'image'),
        path.join(ROOT, 'modules', 'commands', 'cache', 'img'),
        path.join(ROOT, 'modules', 'commands', 'cache', 'audio'),
        path.join(ROOT, 'modules', 'commands', 'cache', 'video'),
    ];
    let deleted = 0;
    for (const dir of DIRS) {
        if (!existsSync(dir)) continue;
        try {
            for (const file of readdirSync(dir)) {
                const fp = path.join(dir, file);
                try {
                    if (statSync(fp).isFile() && EXT.includes(path.extname(file).toLowerCase())) {
                        unlinkSync(fp);
                        deleted++;
                    }
                } catch {}
            }
        } catch {}
    }
    if (deleted > 0) logger(`[تنظيف] تم حذف ${deleted} ملف مؤقت`, 'CLEAN');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  التثبيت التلقائي للمكتبات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function autoInstall() {
    const nodemodDir = path.join(ROOT, 'nodemodules');
    const nodemodModules = path.join(nodemodDir, 'node_modules');
    if (!existsSync(nodemodDir)) mkdirSync(nodemodDir, { recursive: true });
    if (!existsSync(path.join(nodemodDir, 'package.json'))) {
        writeFileSync(path.join(nodemodDir, 'package.json'), JSON.stringify({ name: "nodemodules", version: "1.0.0", dependencies: {} }, null, 2));
    }
    if (!existsSync(nodemodModules) || readdirSync(nodemodModules).length < 5) {
        logger('[تثبيت] جاري تثبيت المكتبات الإضافية تلقائياً...', 'INSTALL');
        const pkgs = ['fs-extra', 'moment-timezone', 'axios', 'request', 'jimp', 'node-fetch', 'cheerio', 'totp-generator', 'string-similarity', 'gtts'];
        try {
            execSync(`npm install --save --package-lock false ${pkgs.join(' ')}`, { stdio: 'inherit', cwd: nodemodDir, shell: true });
            logger('[تثبيت] اكتمل تثبيت المكتبات الإضافية ✅', 'INSTALL');
        } catch (e) {
            logger('[تثبيت] خطأ في التثبيت: ' + e.message, 'WARN');
        }
    }
}

autoCleanup();
autoInstall();
setInterval(autoCleanup, 6 * 60 * 60 * 1000);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   نظام مكافحة الخمول
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function antiIdle() {
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.REPLIT_DEV_DOMAIN || `localhost:${port}`;
    const url = domain.startsWith('http') ? domain : `https://${domain}/`;
    axios.get(url, { timeout: 10000 }).catch(() => {});
}
setInterval(antiIdle, 4 * 60 * 1000);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   Auth Tokens
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const activeSessions = new Set();

function genToken() {
    return crypto.randomBytes(24).toString('hex');
}

function authMiddleware(req, res, next) {
    const token = req.headers['x-auth-token'] || req.query.token;
    if (token && activeSessions.has(token)) return next();
    res.status(401).json({ error: 'غير مصرح' });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   إعداد Express
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   الصفحة الرئيسية / الداشبورد
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/', (req, res) => {
    res.send(getDashboardHTML());
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   API: تسجيل الدخول
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === DASHBOARD_PASS) {
        const token = genToken();
        activeSessions.add(token);
        return res.json({ success: true, token });
    }
    res.status(401).json({ error: 'كلمة المرور خاطئة' });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   API: حالة البوت
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/status', authMiddleware, (req, res) => {
    const uptime = botStartTime ? Math.floor((Date.now() - botStartTime) / 1000) : 0;
    const config = safeReadJSON(path.join(ROOT, 'config.json'));
    res.json({
        status: botStatus,
        uptime,
        botName: config.BOTNAME || 'اليكسي الحربي',
        adminID: config.FACEBOOK_ADMIN || '',
        prefix: config.PREFIX || '',
        logsCount: botLogs.length
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   API: تحكم في البوت
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/bot/start', authMiddleware, (req, res) => {
    if (botStatus === 'running') return res.json({ success: false, message: 'البوت يعمل بالفعل' });
    startBot();
    res.json({ success: true, message: 'تم تشغيل البوت ✅' });
});

app.post('/api/bot/stop', authMiddleware, (req, res) => {
    if (!botProcess) return res.json({ success: false, message: 'البوت متوقف بالفعل' });
    botProcess.kill('SIGTERM');
    botProcess = null;
    botStatus = 'stopped';
    botStartTime = null;
    addLog('⛔ تم إيقاف البوت من الداشبورد');
    res.json({ success: true, message: 'تم إيقاف البوت ⛔' });
});

app.post('/api/bot/restart', authMiddleware, (req, res) => {
    addLog('🔄 إعادة تشغيل من الداشبورد...');
    if (botProcess) {
        botProcess.kill('SIGTERM');
        botProcess = null;
        botStatus = 'stopped';
        botStartTime = null;
    }
    setTimeout(() => startBot(), 1500);
    res.json({ success: true, message: 'تم إعادة التشغيل 🔄' });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   API: السجلات (Logs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/logs', authMiddleware, (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    res.json({ logs: botLogs.slice(-limit) });
});

app.delete('/api/logs', authMiddleware, (req, res) => {
    botLogs = [];
    res.json({ success: true });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   API: إدارة الكوكيز (appstate)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/appstate', authMiddleware, (req, res) => {
    const appstatePath = path.join(ROOT, 'appstate.json');
    if (!existsSync(appstatePath)) return res.json({ exists: false, data: null });
    try {
        const data = readFileSync(appstatePath, 'utf8');
        res.json({ exists: true, data });
    } catch {
        res.json({ exists: false, data: null });
    }
});

app.post('/api/appstate', authMiddleware, (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'لا يوجد بيانات' });
    try {
        JSON.parse(data);
        writeFileSync(path.join(ROOT, 'appstate.json'), data, 'utf8');
        addLog('🍪 تم تحديث appstate (كوكيز) من الداشبورد');
        res.json({ success: true, message: 'تم حفظ الكوكيز ✅' });
    } catch {
        res.status(400).json({ error: 'JSON غير صالح' });
    }
});

app.delete('/api/appstate', authMiddleware, (req, res) => {
    const appstatePath = path.join(ROOT, 'appstate.json');
    if (existsSync(appstatePath)) unlinkSync(appstatePath);
    addLog('🗑️ تم حذف appstate من الداشبورد');
    res.json({ success: true, message: 'تم حذف الكوكيز' });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   API: إدارة الملفات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ALLOWED_DIRS = ['modules', 'database', 'languages', 'img', 'assets'];
const BLOCKED_PATHS = ['node_modules', 'nodemodules', '.git', 'lib'];

function isPathSafe(filePath) {
    const rel = path.relative(ROOT, filePath);
    if (rel.startsWith('..')) return false;
    for (const b of BLOCKED_PATHS) {
        if (rel.startsWith(b)) return false;
    }
    return true;
}

app.get('/api/files', authMiddleware, (req, res) => {
    const relPath = req.query.path || '';
    const absPath = relPath ? path.join(ROOT, relPath) : ROOT;

    if (!isPathSafe(absPath)) return res.status(403).json({ error: 'مسار غير مسموح' });
    if (!existsSync(absPath)) return res.status(404).json({ error: 'المسار غير موجود' });

    try {
        const items = readdirSync(absPath).map(name => {
            const full = path.join(absPath, name);
            const st = statSync(full);
            return {
                name,
                isDir: st.isDirectory(),
                size: st.isFile() ? st.size : 0,
                ext: path.extname(name).toLowerCase(),
                path: path.join(relPath, name)
            };
        }).filter(i => !BLOCKED_PATHS.includes(i.name));

        items.sort((a, b) => {
            if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        res.json({ items, currentPath: relPath });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/file', authMiddleware, (req, res) => {
    const relPath = req.query.path;
    if (!relPath) return res.status(400).json({ error: 'المسار مطلوب' });
    const absPath = path.join(ROOT, relPath);
    if (!isPathSafe(absPath)) return res.status(403).json({ error: 'مسار غير مسموح' });
    if (!existsSync(absPath)) return res.status(404).json({ error: 'الملف غير موجود' });

    try {
        const st = statSync(absPath);
        if (st.size > 500 * 1024) return res.status(413).json({ error: 'الملف كبير جداً للعرض (أكثر من 500KB)' });
        const content = readFileSync(absPath, 'utf8');
        res.json({ content, path: relPath });
    } catch {
        res.status(400).json({ error: 'لا يمكن قراءة هذا الملف (قد يكون ثنائياً)' });
    }
});

app.post('/api/file', authMiddleware, (req, res) => {
    const { path: relPath, content } = req.body;
    if (!relPath) return res.status(400).json({ error: 'المسار مطلوب' });
    const absPath = path.join(ROOT, relPath);
    if (!isPathSafe(absPath)) return res.status(403).json({ error: 'مسار غير مسموح' });
    try {
        fsExtra.ensureDirSync(path.dirname(absPath));
        writeFileSync(absPath, content, 'utf8');
        addLog(`📝 تم تعديل الملف: ${relPath}`);
        res.json({ success: true, message: 'تم حفظ الملف ✅' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/file', authMiddleware, (req, res) => {
    const relPath = req.query.path;
    if (!relPath) return res.status(400).json({ error: 'المسار مطلوب' });
    const absPath = path.join(ROOT, relPath);
    if (!isPathSafe(absPath)) return res.status(403).json({ error: 'مسار غير مسموح' });
    if (!existsSync(absPath)) return res.status(404).json({ error: 'الملف غير موجود' });
    try {
        unlinkSync(absPath);
        addLog(`🗑️ تم حذف الملف: ${relPath}`);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   API: إعدادات البوت (config.json)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function safeReadJSON(filePath) {
    try { return JSON.parse(readFileSync(filePath, 'utf8')); } catch { return {}; }
}

app.get('/api/config', authMiddleware, (req, res) => {
    const config = safeReadJSON(path.join(ROOT, 'config.json'));
    res.json({ config });
});

app.post('/api/config', authMiddleware, (req, res) => {
    const { config } = req.body;
    if (!config) return res.status(400).json({ error: 'لا يوجد بيانات' });
    try {
        const parsed = typeof config === 'string' ? JSON.parse(config) : config;
        writeFileSync(path.join(ROOT, 'config.json'), JSON.stringify(parsed, null, 4), 'utf8');
        addLog('⚙️ تم تعديل config.json من الداشبورد');
        res.json({ success: true, message: 'تم حفظ الإعدادات ✅' });
    } catch {
        res.status(400).json({ error: 'JSON غير صالح' });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   API: تحميل البوت zip
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/download/bot.zip', authMiddleware, (req, res) => {
    try {
        const AdmZip = require('adm-zip');
        const zip = new AdmZip();
        const skipDirs = new Set(['node_modules', '.git', 'nodemodules', '.local', '.upm', '.cache']);
        const skipFiles = new Set(['.env']);
        const MAX_FILE_SIZE = 10 * 1024 * 1024;

        function addEverything(dirPath, zipFolder) {
            let items;
            try { items = readdirSync(dirPath); } catch { return; }
            for (const item of items) {
                if (skipFiles.has(item)) continue;
                const fullPath = path.join(dirPath, item);
                const zipEntry = zipFolder ? zipFolder + '/' + item : item;
                try {
                    const stat = statSync(fullPath);
                    if (stat.isDirectory()) {
                        if (skipDirs.has(item)) continue;
                        addEverything(fullPath, zipEntry);
                    } else {
                        if (stat.size > MAX_FILE_SIZE) continue;
                        zip.addLocalFile(fullPath, zipFolder || '');
                    }
                } catch {}
            }
        }
        addEverything(ROOT, '');
        const buffer = zip.toBuffer();
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="bot-backup.zip"');
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    } catch (e) {
        res.status(500).send('خطأ: ' + e.message);
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   تشغيل الخادم
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.listen(port, '0.0.0.0');

const gio = moment.tz("Asia/Riyadh").format("HH:mm:ss || D/MM/YYYY");
const thu = moment.tz("Asia/Riyadh").format('dddd');
const days = { Sunday: 'الأحد', Monday: 'الاثنين', Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة', Saturday: 'السبت' };
const dayAr = days[thu] || thu;

console.log(`\n   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`         🤖  اليكسي الحربي - Hitler Bot  🤖`);
console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`   📅 اليوم: ${dayAr}   🕐 الوقت: ${gio}`);
console.log(`   🌐 الداشبورد: http://0.0.0.0:${port}/`);
console.log(`   🔑 كلمة مرور الداشبورد: ${DASHBOARD_PASS}`);
console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

logger('المطور: اربرت ساما | اليكسي الحربي 2026', 'معلومات');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   تشغيل البوت
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function startBot(message) {
    if (message) { logger(message, 'بوت'); addLog(message); }

    botProcess = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
        cwd: ROOT,
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
    });

    botStatus = 'running';
    botStartTime = Date.now();
    addLog('✅ تم تشغيل البوت');

    botProcess.stdout && botProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(l => addLog(l));
    });
    botProcess.stderr && botProcess.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        lines.forEach(l => addLog(`⚠️ ${l}`));
    });

    botProcess.on("close", async (codeExit) => {
        botStatus = 'stopped';
        botStartTime = null;
        addLog(`🔴 البوت توقف (كود: ${codeExit})`);
        const x = String(codeExit);
        if (codeExit == 1) {
            addLog('🔄 إعادة تشغيل تلقائي...');
            return startBot('إعادة تشغيل البوت...');
        } else if (x.indexOf('2') == 0) {
            const delay = parseInt(x.replace('2', '')) * 1000;
            addLog(`⏳ انتظار ${delay / 1000} ثانية قبل إعادة التشغيل...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            startBot('البوت يبدأ التشغيل، يرجى الانتظار...');
        }
    });

    botProcess.on("error", function (error) {
        addLog(`❌ خطأ: ${error.message}`);
        logger("خطأ: " + JSON.stringify(error), 'خطأ');
    });
}

setTimeout(() => {
    logger('بدء تحميل الكود المصدري...', 'تحميل');
    startBot();
}, 500);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   HTML الداشبورد
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getDashboardHTML() {
return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🤖 اليكسي الحربي - لوحة التحكم</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #0d0d0d; --bg2: #141414; --bg3: #1a1a1a;
  --card: #1e1e1e; --border: #2a2a2a;
  --red: #e53935; --green: #43a047; --blue: #1e88e5;
  --yellow: #fdd835; --purple: #8e24aa; --orange: #fb8c00;
  --text: #e0e0e0; --text2: #9e9e9e;
}
body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', Arial, sans-serif; min-height: 100vh; }
#login-screen {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; background: linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 100%);
}
.login-box {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 16px; padding: 40px; width: 360px; text-align: center;
  box-shadow: 0 0 40px rgba(229,57,53,0.15);
}
.login-box h1 { font-size: 1.8rem; margin-bottom: 8px; }
.login-box p { color: var(--text2); margin-bottom: 28px; font-size: 0.9rem; }
.login-box input {
  width: 100%; padding: 12px 16px; background: var(--bg3);
  border: 1px solid var(--border); border-radius: 8px;
  color: var(--text); font-size: 1rem; margin-bottom: 14px; outline: none;
  text-align: center;
}
.login-box input:focus { border-color: var(--red); }
.btn {
  padding: 10px 20px; border: none; border-radius: 8px;
  cursor: pointer; font-size: 0.9rem; font-weight: 600;
  transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
}
.btn-red { background: var(--red); color: #fff; }
.btn-green { background: var(--green); color: #fff; }
.btn-blue { background: var(--blue); color: #fff; }
.btn-orange { background: var(--orange); color: #fff; }
.btn-gray { background: #444; color: #fff; }
.btn:hover { opacity: 0.85; transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-full { width: 100%; justify-content: center; }
#app { display: none; }
.sidebar {
  width: 220px; background: var(--card); border-left: 1px solid var(--border);
  position: fixed; top: 0; right: 0; height: 100vh;
  overflow-y: auto; z-index: 10; padding: 20px 0;
}
.sidebar-logo { padding: 0 20px 20px; border-bottom: 1px solid var(--border); }
.sidebar-logo h2 { font-size: 1rem; color: var(--red); }
.sidebar-logo p { font-size: 0.75rem; color: var(--text2); margin-top: 4px; }
.nav-item {
  padding: 12px 20px; cursor: pointer; display: flex; align-items: center;
  gap: 10px; font-size: 0.9rem; transition: all 0.2s;
  border-right: 3px solid transparent;
}
.nav-item:hover { background: var(--bg3); }
.nav-item.active { background: rgba(229,57,53,0.1); border-right-color: var(--red); color: var(--red); }
.nav-icon { font-size: 1.1rem; width: 22px; text-align: center; }
.main-content { margin-right: 220px; padding: 24px; min-height: 100vh; }
.page { display: none; }
.page.active { display: block; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 1.5rem; }
.page-header p { color: var(--text2); font-size: 0.85rem; margin-top: 4px; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 20px;
}
.stat-card { text-align: center; }
.stat-icon { font-size: 2rem; margin-bottom: 8px; }
.stat-value { font-size: 1.6rem; font-weight: 700; }
.stat-label { font-size: 0.8rem; color: var(--text2); margin-top: 4px; }
.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
}
.status-running { background: rgba(67,160,71,0.2); color: var(--green); }
.status-stopped { background: rgba(229,57,53,0.2); color: var(--red); }
.controls-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
.log-box {
  background: #000; border: 1px solid var(--border);
  border-radius: 8px; padding: 16px; height: 350px;
  overflow-y: auto; font-family: 'Courier New', monospace; font-size: 0.82rem;
  line-height: 1.6;
}
.log-line { color: #aaa; }
.log-line:last-child { color: #fff; }
textarea, input[type=text], input[type=password] {
  width: 100%; padding: 10px 14px; background: var(--bg3);
  border: 1px solid var(--border); border-radius: 8px;
  color: var(--text); font-size: 0.9rem; outline: none; resize: vertical;
}
textarea:focus, input[type=text]:focus, input[type=password]:focus { border-color: var(--blue); }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text2); }
.file-tree { background: var(--bg3); border-radius: 8px; padding: 8px; min-height: 200px; }
.file-item {
  padding: 8px 12px; cursor: pointer; border-radius: 6px;
  display: flex; align-items: center; gap: 8px; font-size: 0.88rem;
  transition: background 0.1s;
}
.file-item:hover { background: var(--border); }
.file-item .fi-icon { font-size: 1rem; width: 20px; }
.breadcrumb { font-size: 0.82rem; color: var(--text2); margin-bottom: 10px; }
.breadcrumb span { color: var(--text); cursor: pointer; }
.breadcrumb span:hover { color: var(--blue); }
.editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.editor-header h3 { font-size: 0.95rem; }
.two-col { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
.alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
.alert-success { background: rgba(67,160,71,0.15); border: 1px solid var(--green); color: var(--green); }
.alert-error { background: rgba(229,57,53,0.15); border: 1px solid var(--red); color: var(--red); }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.88rem; }
.info-row:last-child { border-bottom: none; }
.info-label { color: var(--text2); }
.tag { padding: 2px 10px; border-radius: 20px; font-size: 0.8rem; background: var(--bg3); }
@media (max-width: 768px) {
  .sidebar { width: 60px; }
  .sidebar-logo, .nav-item span { display: none; }
  .nav-item { justify-content: center; }
  .main-content { margin-right: 60px; }
  .two-col { grid-template-columns: 1fr; }
}
.pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-green { background: var(--green); box-shadow: 0 0 6px var(--green); }
.dot-red { background: var(--red); }
</style>
</head>
<body>

<!-- شاشة تسجيل الدخول -->
<div id="login-screen">
  <div class="login-box">
    <div style="font-size:3rem;margin-bottom:12px">🤖</div>
    <h1>اليكسي الحربي</h1>
    <p>أدخل كلمة المرور للدخول إلى لوحة التحكم</p>
    <input type="password" id="pass-input" placeholder="كلمة المرور..." onkeypress="if(event.key==='Enter')doLogin()">
    <button class="btn btn-red btn-full" onclick="doLogin()">🔑 دخول</button>
    <div id="login-err" style="margin-top:12px;color:var(--red);font-size:0.85rem;display:none">كلمة المرور خاطئة!</div>
  </div>
</div>

<!-- التطبيق الرئيسي -->
<div id="app">

  <!-- الشريط الجانبي -->
  <div class="sidebar">
    <div class="sidebar-logo">
      <h2>☠️ Hitler Bot</h2>
      <p>لوحة التحكم</p>
    </div>
    <nav>
      <div class="nav-item active" onclick="showPage('status')">
        <span class="nav-icon">📊</span><span>الحالة</span>
      </div>
      <div class="nav-item" onclick="showPage('controls')">
        <span class="nav-icon">🎮</span><span>التحكم</span>
      </div>
      <div class="nav-item" onclick="showPage('cookies')">
        <span class="nav-icon">🍪</span><span>الكوكيز</span>
      </div>
      <div class="nav-item" onclick="showPage('files')">
        <span class="nav-icon">📁</span><span>الملفات</span>
      </div>
      <div class="nav-item" onclick="showPage('config')">
        <span class="nav-icon">⚙️</span><span>الإعدادات</span>
      </div>
      <div class="nav-item" onclick="showPage('logs')">
        <span class="nav-icon">📋</span><span>السجلات</span>
      </div>
      <div class="nav-item" onclick="showPage('backup')">
        <span class="nav-icon">💾</span><span>النسخ الاحتياطي</span>
      </div>
    </nav>
  </div>

  <!-- المحتوى الرئيسي -->
  <div class="main-content">

    <!-- صفحة الحالة -->
    <div id="page-status" class="page active">
      <div class="page-header">
        <h1>📊 حالة البوت</h1>
        <p>مراقبة حالة البوت ومعلوماته</p>
      </div>
      <div class="cards-grid">
        <div class="card stat-card">
          <div class="stat-icon">🤖</div>
          <div class="stat-value" id="s-status-text">---</div>
          <div class="stat-label">حالة البوت</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value" id="s-uptime">0</div>
          <div class="stat-label">وقت التشغيل</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-value" id="s-logs-count">0</div>
          <div class="stat-label">عدد السجلات</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon">👑</div>
          <div class="stat-value" id="s-prefix">---</div>
          <div class="stat-label">البادئة (Prefix)</div>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px">معلومات البوت</h3>
        <div class="info-row">
          <span class="info-label">اسم البوت</span>
          <span id="s-botname" class="tag">---</span>
        </div>
        <div class="info-row">
          <span class="info-label">معرف الأدمن</span>
          <span id="s-adminid" class="tag">---</span>
        </div>
        <div class="info-row">
          <span class="info-label">البادئة</span>
          <span id="s-prefix2" class="tag">---</span>
        </div>
        <div class="info-row">
          <span class="info-label">الداشبورد</span>
          <span class="tag" style="color:var(--green)">نشط ✅</span>
        </div>
      </div>
    </div>

    <!-- صفحة التحكم -->
    <div id="page-controls" class="page">
      <div class="page-header">
        <h1>🎮 التحكم في البوت</h1>
        <p>تشغيل وإيقاف وإعادة تشغيل البوت</p>
      </div>
      <div class="card" style="margin-bottom:20px">
        <h3 style="margin-bottom:6px">الحالة الحالية</h3>
        <p style="color:var(--text2);font-size:0.85rem;margin-bottom:16px">وقت التشغيل: <span id="c-uptime">0</span></p>
        <div id="c-status-badge"></div>
        <div class="controls-row" style="margin-top:20px">
          <button class="btn btn-green" onclick="botAction('start')">▶️ تشغيل</button>
          <button class="btn btn-red" onclick="botAction('stop')">⏹️ إيقاف</button>
          <button class="btn btn-orange" onclick="botAction('restart')">🔄 إعادة تشغيل</button>
        </div>
      </div>
      <div id="action-msg" style="display:none"></div>
    </div>

    <!-- صفحة الكوكيز -->
    <div id="page-cookies" class="page">
      <div class="page-header">
        <h1>🍪 إدارة الكوكيز (Appstate)</h1>
        <p>رفع وإدارة ملف appstate.json للتحقق من هوية الفيسبوك</p>
      </div>
      <div class="card" style="margin-bottom:20px">
        <h3 style="margin-bottom:16px">رفع كوكيز جديدة</h3>
        <div class="form-group">
          <label>الصق محتوى appstate.json هنا (JSON):</label>
          <textarea id="appstate-input" rows="8" placeholder='[{"key":"...","value":"..."}]'></textarea>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-green" onclick="saveAppstate()">💾 حفظ الكوكيز</button>
          <button class="btn btn-gray" onclick="loadAppstate()">📥 تحميل الحالية</button>
          <button class="btn btn-red" onclick="deleteAppstate()">🗑️ حذف</button>
        </div>
        <div id="cookie-msg" style="margin-top:14px;display:none"></div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:12px">معلومات</h3>
        <p style="color:var(--text2);font-size:0.85rem;line-height:1.8">
          • الكوكيز هي ملف appstate.json الذي يحتوي على بيانات تسجيل دخول الفيسبوك<br>
          • يمكنك الحصول عليها باستخدام إضافة المتصفح "State Saver for Facebook"<br>
          • بعد رفع كوكيز جديدة، أعد تشغيل البوت من صفحة التحكم
        </p>
      </div>
    </div>

    <!-- صفحة الملفات -->
    <div id="page-files" class="page">
      <div class="page-header">
        <h1>📁 مدير الملفات</h1>
        <p>تصفح وتعديل ملفات البوت</p>
      </div>
      <div class="two-col">
        <div>
          <div class="breadcrumb" id="file-breadcrumb">📂 <span onclick="loadFiles('')">الجذر</span></div>
          <div class="file-tree" id="file-tree">جاري التحميل...</div>
        </div>
        <div>
          <div class="card" style="height:100%">
            <div class="editor-header">
              <h3 id="editor-filename">اختر ملفاً للتعديل</h3>
              <div style="display:flex;gap:8px">
                <button class="btn btn-green" onclick="saveFile()" id="save-btn" disabled>💾 حفظ</button>
                <button class="btn btn-red" onclick="deleteFile()" id="del-btn" disabled>🗑️</button>
              </div>
            </div>
            <div id="editor-msg" style="display:none;margin-bottom:10px"></div>
            <textarea id="file-editor" rows="22" placeholder="اختر ملفاً من القائمة..." readonly></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- صفحة الإعدادات -->
    <div id="page-config" class="page">
      <div class="page-header">
        <h1>⚙️ إعدادات البوت</h1>
        <p>تعديل الإعدادات الرئيسية من config.json</p>
      </div>
      <div id="config-msg" style="display:none;margin-bottom:16px"></div>
      <div class="card" style="margin-bottom:20px">
        <h3 style="margin-bottom:16px">الإعدادات السريعة</h3>
        <div class="form-group">
          <label>🏷️ اسم البوت (BOTNAME)</label>
          <input type="text" id="cfg-botname">
        </div>
        <div class="form-group">
          <label>📌 البادئة (PREFIX)</label>
          <input type="text" id="cfg-prefix">
        </div>
        <div class="form-group">
          <label>👑 معرف الأدمن (FACEBOOK_ADMIN)</label>
          <input type="text" id="cfg-adminid">
        </div>
        <div class="form-group">
          <label>🌐 اللغة (language)</label>
          <input type="text" id="cfg-lang">
        </div>
        <button class="btn btn-green" onclick="saveQuickConfig()">💾 حفظ الإعدادات السريعة</button>
      </div>
      <div class="card">
        <div class="editor-header">
          <h3>تعديل config.json كاملاً</h3>
          <button class="btn btn-green" onclick="saveFullConfig()">💾 حفظ</button>
        </div>
        <textarea id="config-editor" rows="20" style="margin-top:10px;font-family:monospace;font-size:0.82rem"></textarea>
      </div>
    </div>

    <!-- صفحة السجلات -->
    <div id="page-logs" class="page">
      <div class="page-header">
        <h1>📋 سجلات البوت</h1>
        <p>عرض السجلات والرسائل الحديثة</p>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center">
        <button class="btn btn-blue" onclick="loadLogs()">🔄 تحديث</button>
        <button class="btn btn-red" onclick="clearLogs()">🗑️ مسح السجلات</button>
        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer">
          <input type="checkbox" id="auto-refresh-logs" onchange="toggleAutoRefresh()"> تحديث تلقائي كل 5 ثواني
        </label>
      </div>
      <div class="log-box" id="log-container">جاري التحميل...</div>
    </div>

    <!-- صفحة النسخ الاحتياطي -->
    <div id="page-backup" class="page">
      <div class="page-header">
        <h1>💾 النسخ الاحتياطي</h1>
        <p>تحميل نسخة احتياطية من البوت</p>
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px">تحميل البوت</h3>
        <p style="color:var(--text2);font-size:0.85rem;margin-bottom:20px">
          يتم إنشاء ملف ZIP يحتوي على جميع ملفات البوت (باستثناء node_modules)
        </p>
        <a href="/download/bot.zip?token=" id="download-link">
          <button class="btn btn-blue">📦 تحميل البوت (ZIP)</button>
        </a>
      </div>
    </div>

  </div>
</div>

<script>
let AUTH_TOKEN = '';
let currentFilePath = '';
let autoRefreshLogsInterval = null;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   تسجيل الدخول
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function doLogin() {
  const pass = document.getElementById('pass-input').value;
  if (!pass) return;
  try {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ password: pass })
    });
    const d = await r.json();
    if (d.success) {
      AUTH_TOKEN = d.token;
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      document.getElementById('download-link').href = '/download/bot.zip?token=' + AUTH_TOKEN;
      initApp();
    } else {
      document.getElementById('login-err').style.display = 'block';
    }
  } catch (e) {
    document.getElementById('login-err').style.display = 'block';
  }
}

async function api(url, method='GET', body=null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'x-auth-token': AUTH_TOKEN }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  return r.json();
}

function initApp() {
  refreshStatus();
  setInterval(refreshStatus, 5000);
  showPage('status');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   التنقل بين الصفحات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const navItems = document.querySelectorAll('.nav-item');
  const pages = ['status','controls','cookies','files','config','logs','backup'];
  const idx = pages.indexOf(name);
  if (idx >= 0) navItems[idx].classList.add('active');

  if (name === 'logs') loadLogs();
  if (name === 'files') loadFiles('');
  if (name === 'config') loadConfig();
  if (name === 'cookies') loadAppstate();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   حالة البوت
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function refreshStatus() {
  try {
    const d = await api('/api/status');
    const isRunning = d.status === 'running';
    const upStr = formatUptime(d.uptime || 0);

    document.getElementById('s-status-text').innerHTML = isRunning
      ? '<span class="dot dot-green pulse"></span> يعمل'
      : '<span class="dot dot-red"></span> متوقف';
    document.getElementById('s-uptime').textContent = upStr;
    document.getElementById('s-logs-count').textContent = d.logsCount || 0;
    document.getElementById('s-prefix').textContent = d.prefix || '--';
    document.getElementById('s-botname').textContent = d.botName || '--';
    document.getElementById('s-adminid').textContent = d.adminID || '--';
    document.getElementById('s-prefix2').textContent = d.prefix || '--';

    document.getElementById('c-uptime').textContent = upStr;
    document.getElementById('c-status-badge').innerHTML = isRunning
      ? '<span class="status-badge status-running"><span class="dot dot-green pulse"></span> يعمل الآن</span>'
      : '<span class="status-badge status-stopped">⛔ متوقف</span>';
  } catch {}
}

function formatUptime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return h + 'س ' + m + 'د ' + sec + 'ث';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   تحكم في البوت
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function botAction(action) {
  const el = document.getElementById('action-msg');
  el.style.display = 'none';
  try {
    const d = await api('/api/bot/' + action, 'POST');
    el.className = 'alert ' + (d.success ? 'alert-success' : 'alert-error');
    el.textContent = d.message || d.error;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
    refreshStatus();
  } catch (e) {
    el.className = 'alert alert-error';
    el.textContent = 'خطأ في الاتصال';
    el.style.display = 'block';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   السجلات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadLogs() {
  try {
    const d = await api('/api/logs?limit=200');
    const box = document.getElementById('log-container');
    box.innerHTML = (d.logs || []).map(l => '<div class="log-line">' + escHtml(l) + '</div>').join('') || '<div style="color:var(--text2)">لا يوجد سجلات بعد</div>';
    box.scrollTop = box.scrollHeight;
  } catch {}
}

async function clearLogs() {
  if (!confirm('هل تريد مسح جميع السجلات؟')) return;
  await api('/api/logs', 'DELETE');
  loadLogs();
}

function toggleAutoRefresh() {
  const checked = document.getElementById('auto-refresh-logs').checked;
  if (checked) {
    autoRefreshLogsInterval = setInterval(loadLogs, 5000);
  } else {
    clearInterval(autoRefreshLogsInterval);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   الكوكيز
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadAppstate() {
  const d = await api('/api/appstate');
  if (d.exists && d.data) {
    document.getElementById('appstate-input').value = d.data;
    showCookieMsg('تم تحميل الكوكيز الحالية', true);
  }
}

async function saveAppstate() {
  const data = document.getElementById('appstate-input').value.trim();
  if (!data) return showCookieMsg('أدخل بيانات JSON أولاً', false);
  const d = await api('/api/appstate', 'POST', { data });
  showCookieMsg(d.message || d.error, d.success);
}

async function deleteAppstate() {
  if (!confirm('هل تريد حذف الكوكيز؟')) return;
  const d = await api('/api/appstate', 'DELETE');
  document.getElementById('appstate-input').value = '';
  showCookieMsg(d.message || d.error, d.success);
}

function showCookieMsg(msg, ok) {
  const el = document.getElementById('cookie-msg');
  el.className = 'alert ' + (ok ? 'alert-success' : 'alert-error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   مدير الملفات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadFiles(relPath) {
  const tree = document.getElementById('file-tree');
  tree.innerHTML = '⏳ جاري التحميل...';
  try {
    const d = await api('/api/files?path=' + encodeURIComponent(relPath));
    updateBreadcrumb(relPath);
    tree.innerHTML = '';
    if (relPath) {
      const up = document.createElement('div');
      up.className = 'file-item';
      up.innerHTML = '<span class="fi-icon">⬆️</span> ..';
      up.onclick = () => {
        const parts = relPath.split('/');
        parts.pop();
        loadFiles(parts.join('/'));
      };
      tree.appendChild(up);
    }
    (d.items || []).forEach(item => {
      const el = document.createElement('div');
      el.className = 'file-item';
      const icon = item.isDir ? '📁' : getFileIcon(item.ext);
      el.innerHTML = '<span class="fi-icon">' + icon + '</span><span>' + escHtml(item.name) + '</span>' +
        (item.isDir ? '' : '<span style="margin-right:auto;font-size:0.75rem;color:var(--text2)">' + formatSize(item.size) + '</span>');
      el.onclick = () => {
        if (item.isDir) loadFiles(item.path);
        else openFile(item.path, item.name);
      };
      tree.appendChild(el);
    });
    if (!d.items || d.items.length === 0) {
      tree.innerHTML = '<div style="color:var(--text2);padding:16px;text-align:center">المجلد فارغ</div>';
    }
  } catch (e) {
    tree.innerHTML = '<div style="color:var(--red)">خطأ: ' + e.message + '</div>';
  }
}

function updateBreadcrumb(relPath) {
  const bc = document.getElementById('file-breadcrumb');
  let html = '📂 <span onclick="loadFiles(\\'\\')">الجذر</span>';
  if (relPath) {
    const parts = relPath.split('/');
    let built = '';
    parts.forEach((p, i) => {
      built += (i === 0 ? '' : '/') + p;
      const path = built;
      html += ' / <span onclick="loadFiles(\'' + path + '\')">' + escHtml(p) + '</span>';
    });
  }
  bc.innerHTML = html;
}

async function openFile(filePath, fileName) {
  currentFilePath = filePath;
  document.getElementById('editor-filename').textContent = '✏️ ' + fileName;
  document.getElementById('file-editor').value = 'جاري التحميل...';
  document.getElementById('save-btn').disabled = false;
  document.getElementById('del-btn').disabled = false;
  document.getElementById('file-editor').readOnly = true;
  try {
    const d = await api('/api/file?path=' + encodeURIComponent(filePath));
    if (d.content !== undefined) {
      document.getElementById('file-editor').value = d.content;
      document.getElementById('file-editor').readOnly = false;
    } else {
      document.getElementById('file-editor').value = '⚠️ ' + (d.error || 'لا يمكن قراءة الملف');
    }
  } catch {
    document.getElementById('file-editor').value = 'خطأ في تحميل الملف';
  }
}

async function saveFile() {
  if (!currentFilePath) return;
  const content = document.getElementById('file-editor').value;
  const d = await api('/api/file', 'POST', { path: currentFilePath, content });
  showEditorMsg(d.message || d.error, d.success);
}

async function deleteFile() {
  if (!currentFilePath) return;
  if (!confirm('هل تريد حذف الملف: ' + currentFilePath + '؟')) return;
  const d = await api('/api/file?path=' + encodeURIComponent(currentFilePath), 'DELETE');
  showEditorMsg(d.success ? 'تم حذف الملف' : d.error, d.success);
  if (d.success) {
    currentFilePath = '';
    document.getElementById('file-editor').value = '';
    document.getElementById('editor-filename').textContent = 'اختر ملفاً للتعديل';
    document.getElementById('save-btn').disabled = true;
    document.getElementById('del-btn').disabled = true;
    const parts = currentFilePath.split('/');
    parts.pop();
    loadFiles(parts.join('/'));
  }
}

function showEditorMsg(msg, ok) {
  const el = document.getElementById('editor-msg');
  el.className = 'alert ' + (ok ? 'alert-success' : 'alert-error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   إعدادات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadConfig() {
  const d = await api('/api/config');
  const cfg = d.config || {};
  document.getElementById('cfg-botname').value = cfg.BOTNAME || '';
  document.getElementById('cfg-prefix').value = cfg.PREFIX || '';
  document.getElementById('cfg-adminid').value = cfg.FACEBOOK_ADMIN || '';
  document.getElementById('cfg-lang').value = cfg.language || 'ar';
  document.getElementById('config-editor').value = JSON.stringify(cfg, null, 2);
}

async function saveQuickConfig() {
  const d = await api('/api/config');
  const cfg = d.config || {};
  cfg.BOTNAME = document.getElementById('cfg-botname').value;
  cfg.PREFIX = document.getElementById('cfg-prefix').value;
  cfg.FACEBOOK_ADMIN = document.getElementById('cfg-adminid').value;
  cfg.language = document.getElementById('cfg-lang').value;
  const r = await api('/api/config', 'POST', { config: cfg });
  showConfigMsg(r.message || r.error, r.success);
}

async function saveFullConfig() {
  const raw = document.getElementById('config-editor').value;
  try {
    JSON.parse(raw);
    const r = await api('/api/config', 'POST', { config: raw });
    showConfigMsg(r.message || r.error, r.success);
  } catch {
    showConfigMsg('JSON غير صالح!', false);
  }
}

function showConfigMsg(msg, ok) {
  const el = document.getElementById('config-msg');
  el.className = 'alert ' + (ok ? 'alert-success' : 'alert-error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   مساعدات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function escHtml(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatSize(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b/1024).toFixed(1) + 'KB';
  return (b/1048576).toFixed(1) + 'MB';
}
function getFileIcon(ext) {
  const map = { '.js':'📜', '.json':'📋', '.txt':'📄', '.md':'📝', '.html':'🌐', '.css':'🎨', '.jpg':'🖼️', '.jpeg':'🖼️', '.png':'🖼️', '.mp3':'🎵', '.mp4':'🎬', '.zip':'📦' };
  return map[ext] || '📄';
}
</script>
</body>
</html>`;
}
