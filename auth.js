import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const secret=process.env.JWT_SECRET||"development-secret-change-me";

export function hashPassword(password){return bcrypt.hashSync(password,10)}
export function comparePassword(password,hash){return bcrypt.compareSync(password,hash)}
export function sign(user){return jwt.sign({id:user.id,role:user.role,name:user.name},secret,{expiresIn:"7d"})}
export function auth(req,res,next){
 const h=req.headers.authorization||"";
 if(!h.startsWith("Bearer ")) return res.status(401).json({message:"Token diperlukan"});
 try{req.user=jwt.verify(h.slice(7),secret);next()}catch{return res.status(401).json({message:"Token tidak valid"})}
}
export function role(...roles){return (req,res,next)=>roles.includes(req.user?.role)?next():res.status(403).json({message:"Akses ditolak"})}
