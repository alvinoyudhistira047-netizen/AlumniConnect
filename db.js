import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const dataDir=path.join(__dirname,"..","data");
fs.mkdirSync(dataDir,{recursive:true});
export const db=new Database(path.join(dataDir,"alumniconnect.db"));
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('siswa','alumni','guru','admin')),
 profile_photo TEXT DEFAULT '',
 bio TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS alumni_profiles(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 jurusan TEXT NOT NULL CHECK(jurusan IN ('TKJ','TKR','TBSM','Farmasi')),
 angkatan INTEGER,
 tahun_lulus INTEGER,
 pekerjaan TEXT DEFAULT '',
 perusahaan TEXT DEFAULT '',
 universitas TEXT DEFAULT '',
 lokasi TEXT DEFAULT '',
 keahlian TEXT DEFAULT '',
 status TEXT DEFAULT 'Mencari pekerjaan'
);
CREATE TABLE IF NOT EXISTS posts(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 content TEXT NOT NULL,
 image TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS likes(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
 UNIQUE(user_id,post_id)
);
CREATE TABLE IF NOT EXISTS comments(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
 comment TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS saves(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
 UNIQUE(user_id,post_id)
);
CREATE TABLE IF NOT EXISTS follows(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 UNIQUE(follower_id,following_id)
);
CREATE TABLE IF NOT EXISTS messages(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 message TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS events(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL,
 description TEXT NOT NULL,
 image TEXT DEFAULT '',
 date TEXT NOT NULL,
 time TEXT DEFAULT '',
 location TEXT NOT NULL,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 type TEXT NOT NULL,
 message TEXT NOT NULL,
 is_read INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);
