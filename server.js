import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import {db} from "./db.js";
import {auth,role,hashPassword,comparePassword,sign} from "./auth.js";

dotenv.config();
const app=express();
const PORT=Number(process.env.PORT||4000);
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const uploadDir=path.join(__dirname,"..","uploads");
fs.mkdirSync(uploadDir,{recursive:true});
const upload=multer({dest:uploadDir,limits:{fileSize:5*1024*1024}});
app.use(cors({origin:true}));
app.use(express.json({limit:"1mb"}));
app.use("/uploads",express.static(uploadDir));

app.get("/api/health",(req,res)=>res.json({ok:true,name:"AlumniConnect API",time:new Date().toISOString()}));

app.post("/api/auth/register",(req,res)=>{
 const {name,email,password,role:accountRole,jurusan,angkatan,tahun_lulus}=req.body;
 if(!name||!email||!password||!["siswa","alumni","guru"].includes(accountRole)) return res.status(400).json({message:"Data register belum lengkap"});
 if(db.prepare("SELECT id FROM users WHERE email=?").get(email)) return res.status(409).json({message:"Email sudah terdaftar"});
 const r=db.prepare("INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)").run(name,email,hashPassword(password),accountRole);
 if(accountRole==="alumni"){
   if(!["TKJ","TKR","TBSM","Farmasi"].includes(jurusan)) return res.status(400).json({message:"Jurusan alumni wajib salah satu dari TKJ, TKR, TBSM, Farmasi"});
   db.prepare("INSERT INTO alumni_profiles(user_id,jurusan,angkatan,tahun_lulus,status) VALUES(?,?,?,?,?)").run(r.lastInsertRowid,jurusan,angkatan,tahun_lulus,"Mencari pekerjaan");
 }
 const user=db.prepare("SELECT id,name,email,role FROM users WHERE id=?").get(r.lastInsertRowid);
 res.status(201).json({user,token:sign(user)});
});

app.post("/api/auth/login",(req,res)=>{
 const {email,password}=req.body; const u=db.prepare("SELECT * FROM users WHERE email=?").get(email);
 if(!u||!comparePassword(password,u.password)) return res.status(401).json({message:"Email atau password salah"});
 delete u.password; res.json({user:u,token:sign(u)});
});

app.get("/api/me",auth,(req,res)=>{
 const u=db.prepare("SELECT id,name,email,role,profile_photo,bio FROM users WHERE id=?").get(req.user.id);
 let profile=null;
 if(u?.role==="alumni") profile=db.prepare("SELECT * FROM alumni_profiles WHERE user_id=?").get(u.id);
 res.json({user:u,profile});
});

app.get("/api/alumni",(req,res)=>{
 const {jurusan,status,angkatan,q}=req.query; let sql=`SELECT u.id,u.name,u.profile_photo,u.bio,a.* FROM users u JOIN alumni_profiles a ON a.user_id=u.id WHERE u.role='alumni'`; const args=[];
 if(jurusan&&jurusan!=="Semua"){sql+=" AND a.jurusan=?";args.push(jurusan)}
 if(status&&status!=="Semua"){sql+=" AND a.status=?";args.push(status)}
 if(angkatan){sql+=" AND a.angkatan=?";args.push(angkatan)}
 if(q){sql+=" AND (u.name LIKE ? OR a.pekerjaan LIKE ? OR a.perusahaan LIKE ? OR a.universitas LIKE ?)";args.push(...Array(4).fill(`%${q}%`))}
 sql+=" ORDER BY a.angkatan DESC,u.name";
 res.json(db.prepare(sql).all(...args));
});

app.get("/api/alumni/:id",(req,res)=>{
 const x=db.prepare(`SELECT u.id,u.name,u.email,u.role,u.profile_photo,u.bio,a.* FROM users u JOIN alumni_profiles a ON a.user_id=u.id WHERE u.id=?`).get(req.params.id);
 if(!x)return res.status(404).json({message:"Alumni tidak ditemukan"});res.json(x);
});

app.get("/api/posts",(req,res)=>{
 const rows=db.prepare(`SELECT p.*,u.name,u.role,u.profile_photo,
 (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id) likes,
 (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) comments
 FROM posts p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC`).all();
 res.json(rows);
});

app.post("/api/posts",auth,upload.single("image"),(req,res)=>{
 const image=req.file?`/uploads/${req.file.filename}`:"";
 const {content}=req.body;if(!content?.trim())return res.status(400).json({message:"Konten wajib diisi"});
 const r=db.prepare("INSERT INTO posts(user_id,content,image) VALUES(?,?,?)").run(req.user.id,content.trim(),image);
 res.status(201).json(db.prepare("SELECT * FROM posts WHERE id=?").get(r.lastInsertRowid));
});

app.post("/api/posts/:id/like",auth,(req,res)=>{
 const exists=db.prepare("SELECT id FROM likes WHERE user_id=? AND post_id=?").get(req.user.id,req.params.id);
 if(exists)db.prepare("DELETE FROM likes WHERE id=?").run(exists.id); else db.prepare("INSERT INTO likes(user_id,post_id) VALUES(?,?)").run(req.user.id,req.params.id);
 res.json({liked:!exists,likes:db.prepare("SELECT COUNT(*) c FROM likes WHERE post_id=?").get(req.params.id).c});
});

app.post("/api/posts/:id/save",auth,(req,res)=>{
 const exists=db.prepare("SELECT id FROM saves WHERE user_id=? AND post_id=?").get(req.user.id,req.params.id);
 if(exists)db.prepare("DELETE FROM saves WHERE id=?").run(exists.id); else db.prepare("INSERT INTO saves(user_id,post_id) VALUES(?,?)").run(req.user.id,req.params.id);
 res.json({saved:!exists});
});

app.get("/api/posts/:id/comments",(req,res)=>res.json(db.prepare(`SELECT c.*,u.name,u.role,u.profile_photo FROM comments c JOIN users u ON u.id=c.user_id WHERE c.post_id=? ORDER BY c.created_at DESC`).all(req.params.id)));
app.post("/api/posts/:id/comments",auth,(req,res)=>{
 const {comment}=req.body;if(!comment?.trim())return res.status(400).json({message:"Komentar kosong"});
 const r=db.prepare("INSERT INTO comments(user_id,post_id,comment) VALUES(?,?,?)").run(req.user.id,req.params.id,comment.trim());
 res.status(201).json(db.prepare("SELECT * FROM comments WHERE id=?").get(r.lastInsertRowid));
});

app.post("/api/follows/:id",auth,(req,res)=>{
 if(Number(req.params.id)===req.user.id)return res.status(400).json({message:"Tidak dapat mengikuti diri sendiri"});
 const exists=db.prepare("SELECT id FROM follows WHERE follower_id=? AND following_id=?").get(req.user.id,req.params.id);
 if(exists)db.prepare("DELETE FROM follows WHERE id=?").run(exists.id); else db.prepare("INSERT INTO follows(follower_id,following_id) VALUES(?,?)").run(req.user.id,req.params.id);
 res.json({following:!exists});
});

app.get("/api/events",(req,res)=>res.json(db.prepare("SELECT * FROM events ORDER BY date ASC").all()));
app.post("/api/events",auth,role("admin","guru"),(req,res)=>{
 const {title,description,date,time,location}=req.body;if(!title||!description||!date||!location)return res.status(400).json({message:"Data event belum lengkap"});
 const r=db.prepare("INSERT INTO events(title,description,date,time,location) VALUES(?,?,?,?,?)").run(title,description,date,time||"",location);
 res.status(201).json(db.prepare("SELECT * FROM events WHERE id=?").get(r.lastInsertRowid));
});

app.get("/api/stats",(req,res)=>{
 const total=db.prepare("SELECT COUNT(*) c FROM alumni_profiles").get().c;
 const byMajor=db.prepare("SELECT jurusan,COUNT(*) total FROM alumni_profiles GROUP BY jurusan").all();
 const byStatus=db.prepare("SELECT status,COUNT(*) total FROM alumni_profiles GROUP BY status").all();
 res.json({total,byMajor,byStatus});
});

app.get("/api/admin/users",auth,role("admin"),(req,res)=>res.json(db.prepare("SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC").all()));
app.delete("/api/admin/users/:id",auth,role("admin"),(req,res)=>{db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);res.json({message:"Pengguna dihapus"})});
app.delete("/api/admin/posts/:id",auth,role("admin"),(req,res)=>{db.prepare("DELETE FROM posts WHERE id=?").run(req.params.id);res.json({message:"Postingan dihapus"})});

app.post("/api/ai",auth,(req,res)=>{
 const q=String(req.body.question||"").toLowerCase();
 let answer="Data alumni yang sesuai belum tersedia di database. Admin perlu menambahkan data terlebih dahulu.";
 if(q.includes("tkj")&&(q.includes("kerja")||q.includes("pekerjaan"))){
   const rows=db.prepare("SELECT name,pekerjaan,perusahaan FROM users u JOIN alumni_profiles a ON a.user_id=u.id WHERE a.jurusan='TKJ' AND a.pekerjaan<>''").all();
   answer=rows.length?`Alumni TKJ pada database: ${rows.map(x=>`${x.name} (${x.pekerjaan}${x.perusahaan?`, ${x.perusahaan}`:""})`).join("; ")}.`:"Belum ada data pekerjaan alumni TKJ.";
 } else if(q.includes("2024")){
   const rows=db.prepare("SELECT name,jurusan,universitas,pekerjaan FROM users u JOIN alumni_profiles a ON a.user_id=u.id WHERE a.angkatan=2024").all();
   answer=rows.length?`Data angkatan 2024: ${rows.map(x=>`${x.name} (${x.jurusan})${x.universitas?` kuliah di ${x.universitas}`:""}${x.pekerjaan?` bekerja sebagai ${x.pekerjaan}`:""}`).join("; ")}.`:"Belum ada data angkatan 2024.";
 } else if(q.includes("kuliah")||q.includes("universitas")){
   const rows=db.prepare("SELECT name,jurusan,universitas FROM users u JOIN alumni_profiles a ON a.user_id=u.id WHERE a.universitas<>''").all();
   answer=rows.length?rows.map(x=>`${x.name} (${x.jurusan}) — ${x.universitas}`).join("; "):"Belum ada data universitas alumni.";
 }
 res.json({answer});
});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:"Terjadi kesalahan server"})});
app.listen(PORT,()=>console.log(`AlumniConnect API berjalan di http://localhost:${PORT}`));
