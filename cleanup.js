/**
 * سكريبت تنظيف البوت - يحذف الملفات المؤقتة وغير الضرورية
 * شغّله بـ: node cleanup.js
 */

const fs = require('fs-extra');
const path = require('path');

const DIRS_TO_CLEAN = [
    'modules/commands/cache/tmp',
    'modules/commands/cache/image',
    'modules/commands/cache/img',
    'modules/commands/cache/audio',
    'modules/commands/cache/video',
    'tmp',
    'temp',
];

const FILE_EXTENSIONS_TO_DELETE = ['.jpg', '.jpeg', '.png', '.mp3', '.mp4', '.wav', '.ogg', '.webm', '.tmp'];

let totalDeleted = 0;
let totalSize = 0;

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function cleanDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                cleanDir(filePath);
                continue;
            }
            const ext = path.extname(file).toLowerCase();
            if (FILE_EXTENSIONS_TO_DELETE.includes(ext)) {
                totalSize += stat.size;
                fs.unlinkSync(filePath);
                totalDeleted++;
                console.log(`[حذف] ${filePath}`);
            }
        } catch (e) {}
    }
}

console.log('═══════════════════════════════');
console.log('   🧹 تنظيف ملفات البوت المؤقتة');
console.log('═══════════════════════════════');

for (const dir of DIRS_TO_CLEAN) {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`\n📁 تنظيف: ${dir}`);
        cleanDir(fullPath);
    }
}

console.log('\n═══════════════════════════════');
console.log(`✅ تم الحذف: ${totalDeleted} ملف`);
console.log(`💾 مساحة محررة: ${formatSize(totalSize)}`);
console.log('═══════════════════════════════');
