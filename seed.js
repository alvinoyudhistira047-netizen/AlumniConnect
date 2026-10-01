import {db} from "./db.js";
import {hashPassword} from "./auth.js";

db.exec("DELETE FROM notifications; DELETE FROM messages; DELETE FROM follows; DELETE FROM saves; DELETE FROM comments; DELETE FROM likes; DELETE FROM posts; DELETE FROM alumni_profiles; DELETE FROM events; DELETE FROM users;");
const users=[
 ["Admin AlumniConnect","admin@alumniconnect.local","admin123","admin"],
 ["Ahmad Fauzan","ahmad@alumniconnect.local","demo123","alumni"],
 ["Dimas Pratama","dimas@alumniconnect.local","demo123","alumni"],
 ["Siti Aulia","siti@alumniconnect.local","demo123","alumni"],
 ["Rizky Maulana","rizky@alumniconnect.local","demo123","alumni"],
 ["Nadia Putri","nadia@alumniconnect.local","demo123","alumni"],
 ["Fajar Hidayat","fajar@alumniconnect.local","demo123","alumni"],
 ["Budi Santoso","budi@alumniconnect.local","demo123","siswa"],
 ["Rina Wulandari","rina@alumniconnect.local","demo123","guru"]
];
const insUser=db.prepare("INSERT INTO users(name,email,password,role,bio) VALUES(?,?,?,?,?)");
const ids={};
for(const u of users){const r=insUser.run(u[0],u[1],hashPassword(u[2]),u[3],u[3]==="admin"?"Administrator demo":`Akun ${u[3]} demo`);ids[u[0]]=r.lastInsertRowid}
const insA=db.prepare("INSERT INTO alumni_profiles(user_id,jurusan,angkatan,tahun_lulus,pekerjaan,perusahaan,universitas,lokasi,keahlian,status) VALUES(?,?,?,?,?,?,?,?,?,?)");
insA.run(ids["Ahmad Fauzan"],"TKJ",2022,2022,"Web Developer","Nusantara Digital","","Surabaya","Web Development, JavaScript","Bekerja");
insA.run(ids["Dimas Pratama"],"TKR",2023,2023,"Teknisi Otomotif","Bengkel Jaya Motor","","Sidoarjo","Diagnostik, Mesin","Bekerja");
insA.run(ids["Siti Aulia"],"Farmasi",2022,2022,"","", "Universitas Negeri Malang","Malang","Kefarmasian","Kuliah");
insA.run(ids["Rizky Maulana"],"TBSM",2021,2021,"Pemilik Bengkel","Rizky Motor","","Bojonegoro","Servis Sepeda Motor","Wirausaha");
insA.run(ids["Nadia Putri"],"TKJ",2024,2024,"","", "Politeknik Negeri Surabaya","Surabaya","UI/UX","Kuliah");
insA.run(ids["Fajar Hidayat"],"Farmasi",2023,2023,"Tenaga Kefarmasian","Apotek Sehat","","Lamongan","Kefarmasian","Bekerja");

const post=db.prepare("INSERT INTO posts(user_id,content,image) VALUES(?,?,?)");
post.run(ids["Ahmad Fauzan"],"Setelah lulus, saya belajar programming dari dasar dan sekarang bekerja sebagai Web Developer.","");
post.run(ids["Rina Wulandari"],"Jangan lupa persiapkan diri untuk kegiatan sharing alumni minggu depan.","");
post.run(ids["Dimas Pratama"],"Manfaatkan PKL untuk membangun pengalaman dan relasi di dunia otomotif.","");
post.run(ids["Siti Aulia"],"Melanjutkan kuliah setelah SMK membutuhkan konsistensi belajar. Semangat!","");
post.run(ids["Rizky Maulana"],"Berani memulai usaha kecil bisa menjadi langkah pertama membangun karier.","");

const ev=db.prepare("INSERT INTO events(title,description,date,time,location) VALUES(?,?,?,?,?)");
ev.run("Sharing Alumni: Kuliah atau Kerja?","Sesi berbagi pengalaman alumni untuk siswa.","2026-10-12","09:00 WIB","Aula SMK Muhammadiyah 1 Sumberrejo");
ev.run("Reuni Alumni 2026","Silaturahmi alumni lintas angkatan.","2026-10-25","10:00 WIB","SMK Muhammadiyah 1 Sumberrejo");
ev.run("Workshop Persiapan Kerja","CV, interview, dan etika memasuki dunia kerja.","2026-11-05","08:00 WIB","Lab Komputer");

console.log("Seed selesai.");
console.log("Admin: admin@alumniconnect.local / admin123");
console.log("Demo alumni: ahmad@alumniconnect.local / demo123");
