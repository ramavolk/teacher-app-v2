const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new Database(dbPath);

// Включаем WAL режим
const result = db.pragma('journal_mode = WAL');
console.log('Journal mode set to:', result);

db.close();
console.log('✅ База данных переведена в режим WAL');