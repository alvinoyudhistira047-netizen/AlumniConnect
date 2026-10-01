import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Home, Users, GraduationCap, BriefcaseBusiness, Sparkles, CalendarDays,
  BarChart3, Bookmark, Bell, Search, Menu, X, Heart, MessageCircle,
  Share2, MoreHorizontal, Send, LogOut, Settings, ShieldCheck, UserRound,
  ChevronRight, Plus, Bot, MapPin, Building2, BookOpen, CheckCircle2
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const demoPosts = [
  {id:1, user:{name:"Ahmad Fauzan", role:"Alumni", major:"TKJ", batch:"2022"}, content:"Setelah lulus dari SMK Muhammadiyah 1 Sumberrejo, saya belajar programming secara bertahap. Sekarang saya bekerja sebagai Web Developer. Jangan takut mulai dari dasar!", likes:128, comments:24, liked:false, saved:false, time:"2 jam lalu", image:"https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80"},
  {id:2, user:{name:"Bu Rina", role:"Guru", major:"", batch:""}, content:"Pengumuman: jangan lupa persiapkan diri untuk kegiatan sharing alumni minggu depan. Akan ada sesi tanya jawab tentang kuliah dan dunia kerja.", likes:86, comments:12, liked:false, saved:false, time:"5 jam lalu", image:"https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"},
  {id:3, user:{name:"Dimas Pratama", role:"Alumni", major:"TKR", batch:"2023"}, content:"Tips untuk teman-teman TKR: manfaatkan waktu PKL untuk belajar sebanyak mungkin. Relasi dan pengalaman praktik sangat membantu saat mencari kerja.", likes:74, comments:9, liked:false, saved:false, time:"Kemarin", image:"https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80"}
];

const alumni = [
  {id:1,name:"Ahmad Fauzan",major:"TKJ",batch:"2022",status:"Bekerja",job:"Web Developer",company:"Nusantara Digital",location:"Surabaya",university:"",bio:"Suka berbagi pengalaman belajar programming.",avatar:"AF"},
  {id:2,name:"Dimas Pratama",major:"TKR",batch:"2023",status:"Bekerja",job:"Teknisi Otomotif",company:"Bengkel Jaya Motor",location:"Sidoarjo",university:"",bio:"Teknisi otomotif dan mentor untuk siswa SMK.",avatar:"DP"},
  {id:3,name:"Siti Aulia",major:"Farmasi",batch:"2022",status:"Kuliah",job:"",company:"",location:"Malang",university:"Universitas Negeri Malang",bio:"Sedang melanjutkan pendidikan dan aktif di komunitas.",avatar:"SA"},
  {id:4,name:"Rizky Maulana",major:"TBSM",batch:"2021",status:"Wirausaha",job:"Pemilik Bengkel",company:"Rizky Motor",location:"Bojonegoro",university:"",bio:"Membangun usaha bengkel setelah lulus.",avatar:"RM"},
  {id:5,name:"Nadia Putri",major:"TKJ",batch:"2024",status:"Kuliah",job:"",company:"",location:"Surabaya",university:"Politeknik Negeri Surabaya",bio:"Mahasiswi yang tertarik pada UI/UX.",avatar:"NP"},
  {id:6,name:"Fajar Hidayat",major:"Farmasi",batch:"2023",status:"Bekerja",job:"Tenaga Kefarmasian",company:"Apotek Sehat",location:"Lamongan",university:"",bio:"Berbagi informasi tentang dunia kefarmasian.",avatar:"FH"}
];

const events = [
  {id:1,title:"Sharing Alumni: Kuliah atau Kerja?",date:"12 Oktober 2026",time:"09:00 WIB",location:"Aula SMK Muhammadiyah 1 Sumberrejo",desc:"Sesi berbagi pengalaman alumni untuk siswa."},
  {id:2,title:"Reuni Alumni 2026",date:"25 Oktober 2026",time:"10:00 WIB",location:"SMK Muhammadiyah 1 Sumberrejo",desc:"Silaturahmi alumni lintas angkatan."},
  {id:3,title:"Workshop Persiapan Kerja",date:"5 November 2026",time:"08:00 WIB",location:"Lab Komputer",desc:"CV, interview, dan etika memasuki dunia kerja."}
];

function App(){
  const [page,setPage]=useState("home");
  const [mobile,setMobile]=useState(false);
  const [posts,setPosts]=useState(demoPosts);
  const [saved,setSaved]=useState([]);
  const [query,setQuery]=useState("");
  const [major,setMajor]=useState("Semua");
  const [status,setStatus]=useState("Semua");
  const [toast,setToast]=useState("");
  const [profile,setProfile]=useState(null);
  const [aiMessages,setAiMessages]=useState([{from:"ai",text:"Halo! Saya AlumniConnect AI. Tanyakan tentang karier, kuliah, atau pengalaman alumni. Saya akan menggunakan data demo yang tersedia dan tidak akan mengarang data alumni."}]);
  const [aiInput,setAiInput]=useState("");
  const [commenting,setCommenting]=useState(null);
  const [commentText,setCommentText]=useState("");
  const [showLogin,setShowLogin]=useState(false);

  useEffect(()=>{ 
    fetch(API+"/health").catch(()=>{});
  },[]);

  function notify(msg){setToast(msg); setTimeout(()=>setToast(""),2200)}
  function toggleLike(id){
    setPosts(ps=>ps.map(p=>p.id===id?{...p,liked:!p.liked,likes:p.likes+(p.liked?-1:1)}:p));
  }
  function toggleSave(id){
    const p=posts.find(x=>x.id===id);
    setPosts(ps=>ps.map(x=>x.id===id?{...x,saved:!x.saved}:x));
    setSaved(s=>p.saved?s.filter(x=>x!==id):[...s,id]);
    notify(p.saved?"Postingan dihapus dari simpanan":"Postingan disimpan");
  }
  function addComment(id){
    if(!commentText.trim()) return;
    setPosts(ps=>ps.map(p=>p.id===id?{...p,comments:p.comments+1}:p));
    setCommenting(null); setCommentText(""); notify("Komentar berhasil ditambahkan");
  }
  function share(id){
    const url=location.href+"#post-"+id;
    navigator.clipboard?.writeText(url);
    notify("Link postingan disalin");
  }
  function createPost(){
    const content=prompt("Tulis postingan baru:");
    if(!content?.trim()) return;
    setPosts(ps=>[{id:Date.now(),user:{name:"Kamu",role:"Siswa",major:"TKJ",batch:""},content,likes:0,comments:0,liked:false,saved:false,time:"Baru saja"},...ps]);
    notify("Postingan berhasil dibuat");
  }
  function sendAI(text=aiInput){
    if(!text.trim()) return;
    const q=text.trim();
    setAiMessages(m=>[...m,{from:"user",text:q}]); setAiInput("");
    setTimeout(()=>{
      const l=q.toLowerCase();
      let answer="Berdasarkan data demo AlumniConnect, belum ada data spesifik untuk pertanyaan itu. Coba tanyakan nama jurusan, angkatan, pekerjaan, atau universitas.";
      if(l.includes("tkj") && (l.includes("kerja")||l.includes("pekerjaan"))) answer="Pada data demo, alumni TKJ bekerja sebagai Web Developer. Bidang yang relevan untuk TKJ antara lain Web Developer, Programmer, IT Support, jaringan, dan bidang digital lainnya. Untuk data sekolah yang sebenarnya, admin perlu memasukkan data alumni terlebih dahulu.";
      else if(l.includes("hai")||l.includes(hallo)) answer="haii,apakah ada yang bisa saya bantu?";
      else if(l.includes("2024")) answer="Data demo memiliki alumni TKJ angkatan 2024 bernama Nadia Putri yang sedang kuliah di Politeknik Negeri Surabaya. Ini hanya data demo, bukan data alumni sekolah yang sebenarnya.";
      else if(l.includes("kuliah")||l.includes("universitas")) answer="Pada data demo, Siti Aulia (Farmasi, 2022) kuliah di Universitas Negeri Malang dan Nadia Putri (TKJ, 2024) kuliah di Politeknik Negeri Surabaya.";
      else if(l.includes("tkr")) answer="Pada data demo, Dimas Pratama (TKR, 2023) bekerja sebagai Teknisi Otomotif. Bidang terkait TKR dapat meliputi teknisi, mekanik, service advisor, dan bidang otomotif.";
      else if(l.includes("tbsm")) answer="Pada data demo, Rizky Maulana (TBSM, 2021) menjadi pemilik bengkel. Bidang TBSM dapat berkembang ke mekanik sepeda motor, teknisi, service, atau wirausaha bengkel.";
      else if(l.includes("farmasi")) answer="Pada data demo, Siti Aulia (Farmasi, 2022) melanjutkan kuliah dan Fajar Hidayat (Farmasi, 2023) bekerja sebagai Tenaga Kefarmasian. Informasi pekerjaan harus disesuaikan dengan data resmi sekolah.";
      else if(l.includes("programmer")) answer="Jika ingin menjadi programmer, kamu bisa mulai dari logika pemrograman, HTML, CSS, JavaScript, Git, database, lalu membuat proyek portofolio. AlumniConnect AI juga dapat membantu membuat roadmap belajar.";
      setAiMessages(m=>[...m,{from:"ai",text:answer}]);
    },450);
  }

  const filteredAlumni=useMemo(()=>alumni.filter(a=>
    (major==="Semua"||a.major===major) &&
    (status==="Semua"||a.status===status) &&
    (a.name+" "+a.major+" "+a.job+" "+a.company+" "+a.university).toLowerCase().includes(query.toLowerCase())
  ),[major,status,query]);

  const nav=[
    ["home","Beranda",Home],["alumni","Data Alumni",Users],["majors","Jurusan",GraduationCap],
    ["batches","Angkatan",BookOpen],["career","Karier Alumni",BriefcaseBusiness],
    ["inspiring","Alumni Inspiratif",Sparkles],["events","Event/Reuni",CalendarDays],
    ["ai","AlumniConnect AI",Bot],["stats","Statistik Alumni",BarChart3]
  ];

  return <div className="app">
    <header className="mobile-header">
      <button className="icon-btn" onClick={()=>setMobile(true)}><Menu/></button>
      <Logo onClick={()=>setPage("home")}/>
      <button className="icon-btn" onClick={()=>setShowLogin(true)}><UserRound/></button>
    </header>

    <aside className={"sidebar "+(mobile?"open":"")}>
      <div className="side-top"><Logo onClick={()=>{setPage("home");setMobile(false)}}/><button className="icon-btn close" onClick={()=>setMobile(false)}><X/></button></div>
      <div className="school">SMK Muhammadiyah 1 Sumberrejo</div>
      <nav>{nav.map(([id,label,Icon])=><button key={id} className={page===id?"nav-item active":"nav-item"} onClick={()=>{setPage(id);setMobile(false)}}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="nav-divider"/>
      <button className="nav-item" onClick={()=>notify("Halaman profil demo")}><UserRound size={19}/><span>Profil</span></button>
      <button className="nav-item" onClick={()=>notify("Pengaturan demo")}><Settings size={19}/><span>Pengaturan</span></button>
      <button className="nav-item" onClick={()=>setShowLogin(true)}><LogOut size={19}/><span>Masuk / Keluar</span></button>
      <div className="side-bottom"><ShieldCheck size={16}/> Data demo — siap dikembangkan</div>
    </aside>

    <main className="main">
      <div className="topbar">
        <div className="desktop-logo"><Logo onClick={()=>setPage("home")}/></div>
        <div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari alumni, pekerjaan, jurusan..."/></div>
        <button className="notification" onClick={()=>notify("Tidak ada notifikasi baru")}><Bell size={19}/><span></span></button>
        <button className="avatar-btn" onClick={()=>setShowLogin(true)}>AC</button>
      </div>

      {page==="home" && <HomePage posts={posts} toggleLike={toggleLike} toggleSave={toggleSave} share={share} setCommenting={setCommenting} createPost={createPost} onAlumni={()=>setPage("alumni")} events={events} setPage={setPage}/>}
      {page==="alumni" && <AlumniPage data={filteredAlumni} major={major} setMajor={setMajor} status={status} setStatus={setStatus} query={query} open={a=>{setProfile(a);setPage("profile")}}/>}
      {page==="profile" && profile && <ProfilePage a={profile} onBack={()=>setPage("alumni")}/>}
      {page==="majors" && <MajorPage setPage={setPage}/>}
      {page==="batches" && <BatchPage data={alumni} open={a=>{setProfile(a);setPage("profile")}}/>}
      {page==="career" && <CareerPage data={alumni}/>}
      {page==="inspiring" && <InspiringPage data={alumni}/>}
      {page==="events" && <EventsPage events={events}/>}
      {page==="ai" && <AIPage messages={aiMessages} input={aiInput} setInput={setAiInput} send={sendAI}/>}
      {page==="stats" && <StatsPage data={alumni}/>}
      {page==="saved" && <SavedPage posts={posts.filter(p=>saved.includes(p.id))}/>}
    </main>

    {commenting && <div className="modal-backdrop" onClick={()=>setCommenting(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-head"><h3>Komentar</h3><button className="icon-btn" onClick={()=>setCommenting(null)}><X/></button></div>
      <div className="comment-row"><Avatar text="K"/><div><b>Kamu</b><p>Tulis komentar yang sopan dan bermanfaat.</p></div></div>
      <div className="comment-input"><input autoFocus value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Tulis komentar..."/><button className="primary" onClick={()=>addComment(commenting)}><Send size={17}/></button></div>
    </div></div>}

    {showLogin && <div className="modal-backdrop" onClick={()=>setShowLogin(false)}><div className="login-modal" onClick={e=>e.stopPropagation()}>
      <div className="login-brand"><Logo/><p>Masuk ke ekosistem alumni sekolah.</p></div>
      <label>Email / Username<input placeholder="contoh@email.com"/></label>
      <label>Password<input type="password" placeholder="••••••••"/></label>
      <button className="primary wide" onClick={()=>{setShowLogin(false);notify("Mode demo: login belum terhubung ke server")}}>Masuk</button>
      <small>Untuk demo UI, backend dan database tersedia di folder <b>backend</b>.</small>
    </div></div>}

    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
  </div>
}

function Logo({onClick}){return <button className="logo" onClick={onClick}><span className="logo-mark">A</span><span><b>Alumni</b><em>Connect</em></span></button>}
function Avatar({text="AC",large=false}){return <div className={"avatar "+(large?"large":"")}>{text}</div>}

function HomePage({posts,toggleLike,toggleSave,share,setCommenting,createPost,onAlumni,events,setPage}){
 return <div className="page">
  <section className="hero">
   <div><span className="eyebrow">SMK MUHAMMADIYAH 1 SUMBERREJO</span><h1>Terhubung dengan <span>alumni.</span><br/>Temukan inspirasi masa depan.</h1><p>AlumniConnect membantu siswa mengenal perjalanan alumni, dunia kerja, kuliah, dan komunitas sekolah dalam satu tempat.</p>
   <div className="hero-actions"><button className="primary" onClick={onAlumni}>Jelajahi Alumni <ChevronRight size={17}/></button><button className="secondary" onClick={()=>setPage("ai")}><Sparkles size={17}/> Tanya AI</button></div></div>
   <div className="hero-art"><div className="floating-card one"><GraduationCap/><div><b>4 Jurusan</b><small>TKJ · TKR · TBSM · Farmasi</small></div></div><div className="hero-circle"><Users size={65}/><strong>Alumni</strong><span>Connect</span></div><div className="floating-card two"><BriefcaseBusiness/><div><b>Karier & Kuliah</b><small>Temukan cerita nyata</small></div></div></div>
  </section>
  <div className="section-head"><div><h2>Community Feed</h2><p>Cerita dan informasi terbaru dari komunitas sekolah.</p></div><button className="secondary" onClick={createPost}><Plus size={17}/> Buat Postingan</button></div>
  <div className="feed-layout"><div className="feed">
   <div className="story-row">{["AF","DP","SA","RM","NP","FH"].map((x,i)=><div className="story" key={x}><Avatar text={x}/><span>{["Ahmad","Dimas","Siti","Rizky","Nadia","Fajar"][i]}</span></div>)}</div>
   {posts.map(p=><PostCard key={p.id} p={p} toggleLike={toggleLike} toggleSave={toggleSave} share={share} setCommenting={setCommenting}/>)}
  </div><aside className="right-col">
   <div className="side-card"><h3>Alumni terbaru</h3>{["Ahmad Fauzan","Siti Aulia","Nadia Putri"].map((n,i)=><div className="mini-user" key={n}><Avatar text={n.split(" ").map(x=>x[0]).join("")}/><div><b>{n}</b><small>{["TKJ · 2022","Farmasi · 2022","TKJ · 2024"][i]}</small></div><button onClick={onAlumni}>Lihat</button></div>)}</div>
   <div className="side-card"><h3>Event terdekat</h3><div className="event-mini"><div className="date-box"><b>12</b><small>OKT</small></div><div><b>Sharing Alumni</b><small>09:00 · Aula Sekolah</small></div></div><button className="text-btn" onClick={()=>setPage("events")}>Lihat semua event <ChevronRight size={15}/></button></div>
  </aside></div>
 </div>
}

function PostCard({p,toggleLike,toggleSave,share,setCommenting}){
 return <article className="post-card" id={"post-"+p.id}>
  <div className="post-head"><Avatar text={p.user.name.split(" ").map(x=>x[0]).join("").slice(0,2)}/><div className="post-author"><b>{p.user.name}</b><div><span className={"badge "+p.user.role.toLowerCase()}>{p.user.role}</span>{p.user.major&&<span>{p.user.major} · {p.user.batch}</span>}<span>· {p.time}</span></div></div><button className="icon-btn"><MoreHorizontal/></button></div>
  <p className="post-content">{p.content}</p>{p.image&&<img className="post-image" src={p.image}/>}
  <div className="post-stats"><span>{p.likes} suka</span><span>{p.comments} komentar</span></div>
  <div className="post-actions"><button className={p.liked?"liked":""} onClick={()=>toggleLike(p.id)}><Heart size={19} fill={p.liked?"currentColor":"none"}/> Suka</button><button onClick={()=>setCommenting(p.id)}><MessageCircle size={19}/> Komentar</button><button onClick={()=>share(p.id)}><Share2 size={19}/> Bagikan</button><button className={p.saved?"saved":""} onClick={()=>toggleSave(p.id)}><Bookmark size={19} fill={p.saved?"currentColor":"none"}/></button></div>
 </article>
}

function AlumniPage({data,major,setMajor,status,setStatus,query,open}){
 return <div className="page"><PageTitle title="Data Alumni" desc="Temukan profil dan perjalanan alumni dari empat jurusan." icon={Users}/>
 <div className="filterbar"><div className="filter-search"><Search size={17}/><input value={query} readOnly placeholder="Cari alumni, pekerjaan, perusahaan..."/></div><select value={major} onChange={e=>setMajor(e.target.value)}>{["Semua","TKJ","TKR","TBSM","Farmasi"].map(x=><option key={x}>{x}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}>{["Semua","Bekerja","Kuliah","Wirausaha","Mencari pekerjaan"].map(x=><option key={x}>{x}</option>)}</select></div>
 <div className="alumni-grid">{data.map(a=><div className="alumni-card" key={a.id}><div className="cover"></div><Avatar text={a.avatar} large/><div className="alumni-body"><div className="card-title"><div><h3>{a.name}</h3><span className="badge alumni">Alumni</span></div><span className="major-pill">{a.major}</span></div><p className="muted">{a.batch} · {a.status}</p><div className="profile-detail"><span><BriefcaseBusiness size={15}/>{a.job||"Mahasiswa"}</span><span><Building2 size={15}/>{a.company||a.university}</span><span><MapPin size={15}/>{a.location}</span></div><button className="secondary wide" onClick={()=>open(a)}>Lihat Profil</button></div></div>)}</div>
 {data.length===0&&<Empty text="Alumni tidak ditemukan dengan filter tersebut."/>}</div>
}

function ProfilePage({a,onBack}){return <div className="page"><button className="back-btn" onClick={onBack}>← Kembali ke Data Alumni</button><section className="profile-card"><div className="profile-cover"></div><div className="profile-main"><Avatar text={a.avatar} large/><div className="profile-info"><div><h1>{a.name}</h1><span className="badge alumni">Alumni</span></div><p>{a.bio}</p><div className="chips"><span>{a.major}</span><span>Angkatan {a.batch}</span><span>{a.status}</span></div></div><button className="primary">Ikuti Alumni</button></div><div className="profile-tabs"><b>Postingan</b><span>Pengalaman</span><span>Pendidikan</span><span>Karier</span></div></section><div className="two-col"><div className="detail-card"><h3>Informasi</h3><Info label="Pekerjaan" value={a.job||"Mahasiswa"}/><Info label="Perusahaan/Universitas" value={a.company||a.university}/><Info label="Lokasi" value={a.location}/><Info label="Keahlian" value={a.major==="TKJ"?"Web Development, Networking":a.major==="TKR"?"Otomotif & Diagnostik":a.major==="TBSM"?"Sepeda Motor & Servis":"Kefarmasian"}/></div><div className="detail-card"><h3>Cerita Alumni</h3><p className="story-text">Profil ini merupakan data demo untuk menunjukkan bagaimana perjalanan alumni dapat ditampilkan. Data sebenarnya dapat dikelola oleh admin sekolah setelah sistem backend terhubung.</p></div></div></div>}
function Info({label,value}){return <div className="info-row"><small>{label}</small><b>{value}</b></div>}

function MajorPage({setPage}){const arr=[["TKJ","Teknik Komputer dan Jaringan","#dbeafe",Users],["TKR","Teknik Kendaraan Ringan"," #fef3c7",BriefcaseBusiness],["TBSM","Teknik dan Bisnis Sepeda Motor","#dcfce7",Building2],["Farmasi","Farmasi","#fce7f3",Sparkles]];return <div className="page"><PageTitle title="Jurusan" desc="Empat jurusan yang menjadi bagian dari komunitas AlumniConnect." icon={GraduationCap}/><div className="major-grid">{arr.map(([m,d,c,I])=><div className="major-card" key={m}><div className="major-icon" style={{background:c}}><I/></div><h2>{m}</h2><p>{d}</p><div className="major-stats"><span>{alumni.filter(a=>a.major===m).length} alumni demo</span><ChevronRight/></div><button className="text-btn" onClick={()=>setPage("alumni")}>Lihat alumni <ChevronRight size={15}/></button></div>)}</div></div>}
function BatchPage({data,open}){const batches=[...new Set(data.map(a=>a.batch))].sort((a,b)=>b-a);return <div className="page"><PageTitle title="Angkatan Alumni" desc="Jelajahi alumni berdasarkan tahun kelulusan." icon={BookOpen}/><div className="batch-grid">{batches.map(b=><div className="batch-card" key={b}><span>ANGKATAN</span><h2>{b}</h2><p>{data.filter(a=>a.batch===b).length} alumni demo</p><div>{data.filter(a=>a.batch===b).map(a=><button key={a.id} className="mini-alumni" onClick={()=>open(a)}><Avatar text={a.avatar}/>{a.name}<ChevronRight size={15}/></button>)}</div></div>)}</div></div>}
function CareerPage({data}){const jobs={TKJ:["Web Developer","IT Support","Programmer"],TKR:["Teknisi Otomotif","Mekanik","Service Advisor"],TBSM:["Pemilik Bengkel","Mekanik Motor","Teknisi"],Farmasi:["Tenaga Kefarmasian","Asisten Apoteker","Administrasi Farmasi"]};return <div className="page"><PageTitle title="Karier Alumni" desc="Gambaran bidang karier dari data alumni demo." icon={BriefcaseBusiness}/><div className="metric-grid"><Metric n={data.filter(a=>a.status==="Bekerja").length} l="Bekerja"/><Metric n={data.filter(a=>a.status==="Kuliah").length} l="Kuliah"/><Metric n={data.filter(a=>a.status==="Wirausaha").length} l="Wirausaha"/><Metric n={data.filter(a=>a.status==="Mencari pekerjaan").length} l="Mencari Kerja"/></div><div className="career-grid">{Object.entries(jobs).map(([m,js])=><div className="detail-card" key={m}><div className="card-title"><h3>{m}</h3><span className="major-pill">{data.filter(a=>a.major===m).length} data</span></div>{js.map(j=><div className="job-row" key={j}><span><CheckCircle2 size={16}/>{j}</span><small>Bidang terkait</small></div>)}</div>)}</div></div>}
function Metric({n,l}){return <div className="metric"><span>{l}</span><b>{n}</b><small>data demo</small></div>}
function InspiringPage({data}){return <div className="page"><PageTitle title="Alumni Inspiratif" desc="Cerita perjalanan alumni yang dapat menjadi inspirasi siswa." icon={Sparkles}/><div className="inspiring-grid">{data.slice(0,4).map((a,i)=><div className="inspiring-card" key={a.id}><div className="inspire-img"><Avatar text={a.avatar} large/><span>Alumni {a.major}</span></div><div className="inspire-body"><h2>{a.name}</h2><p>“Dari SMK hingga melangkah ke dunia {a.status.toLowerCase()}. Perjalanan dimulai dari berani mencoba dan terus belajar.”</p><div className="inspire-foot"><span>{a.batch}</span><button className="text-btn">Baca cerita <ChevronRight size={15}/></button></div></div></div>)}</div></div>}
function EventsPage({events}){return <div className="page"><PageTitle title="Event & Reuni" desc="Kegiatan, reuni, workshop, dan sharing alumni." icon={CalendarDays}/><div className="event-grid">{events.map(e=><div className="event-card" key={e.id}><div className="event-top"><CalendarDays/><span>{e.date}</span></div><h2>{e.title}</h2><p>{e.desc}</p><div className="event-info"><span><CalendarDays size={15}/>{e.time}</span><span><MapPin size={15}/>{e.location}</span></div><button className="primary wide" onClick={()=>alert("Demo: pendaftaran event akan tersimpan melalui backend.")}>Daftar Event</button></div>)}</div></div>}
function AIPage({messages,input,setInput,send}){return <div className="page ai-page"><div className="ai-shell"><div className="ai-head"><div className="ai-logo"><Bot/></div><div><h1>AlumniConnect AI</h1><p>Temanmu untuk mengenal dunia alumni dan masa depan karier.</p></div><span className="ai-online">● Online</span></div><div className="quick">{["Saya lulusan TKJ, pekerjaan apa yang cocok?","Alumni angkatan 2024 sekarang kuliah di mana?","Apa pekerjaan alumni TKR?","Saya jurusan Farmasi, bisa bekerja sebagai apa?"].map(q=><button key={q} onClick={()=>send(q)}>{q}</button>)}</div><div className="chat">{messages.map((m,i)=><div className={"msg "+m.from} key={i}>{m.from==="ai"&&<div className="ai-mini"><Bot size={15}/></div>}<div className="bubble">{m.text}</div></div>)}</div><div className="ai-input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Tanyakan tentang alumni, pekerjaan, kuliah..."/><button className="primary" onClick={()=>send()}><Send size={18}/></button></div><small className="ai-note">AI demo menggunakan data alumni contoh. Jangan masukkan data pribadi sensitif.</small></div></div>}
function StatsPage({data}){const counts=["TKJ","TKR","TBSM","Farmasi"].map(m=>({m,n:data.filter(a=>a.major===m).length}));return <div className="page"><PageTitle title="Statistik Alumni" desc="Ringkasan data alumni demo AlumniConnect." icon={BarChart3}/><div className="metric-grid"><Metric n={data.length} l="Total Alumni"/><Metric n={data.filter(a=>a.status==="Bekerja").length} l="Bekerja"/><Metric n={data.filter(a=>a.status==="Kuliah").length} l="Kuliah"/><Metric n={data.filter(a=>a.status==="Wirausaha").length} l="Wirausaha"/></div><div className="stats-card"><h2>Alumni berdasarkan jurusan</h2>{counts.map(x=><div className="bar-row" key={x.m}><span>{x.m}</span><div className="bar"><i style={{width:`${Math.max(15,x.n/data.length*100)}%`}}/></div><b>{x.n}</b></div>)}</div><div className="notice"><ShieldCheck/><div><b>Catatan data</b><p>Angka di halaman ini adalah data demo untuk presentasi. Admin dapat menggantinya dengan data resmi sekolah melalui backend.</p></div></div></div>}
function SavedPage({posts}){return <div className="page"><PageTitle title="Postingan Tersimpan" desc="Kumpulan postingan yang kamu simpan." icon={Bookmark}/>{posts.length?<div className="feed">{posts.map(p=><PostCard key={p.id} p={p} toggleLike={()=>{}} toggleSave={()=>{}} share={()=>{}} setCommenting={()=>{}}/>)}</div>:<Empty text="Belum ada postingan yang disimpan."/>}</div>}
function PageTitle({title,desc,icon:Icon}){return <div className="page-title"><div className="title-icon"><Icon/></div><div><h1>{title}</h1><p>{desc}</p></div></div>}
function Empty({text}){return <div className="empty"><Search size={28}/><h3>{text}</h3></div>}

createRoot(document.getElementById("root")).render(<App/>);
