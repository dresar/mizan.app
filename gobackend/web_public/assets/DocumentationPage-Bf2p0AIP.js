import{r as g,e,q as k,G as R,K as G,Q as K,V as y,aG as L,ay as U,aH as S,ck as D}from"./index-BYEJ99Fb.js";import{P as F}from"./PageHeader-BTfcdO8C.js";import{B as f}from"./badge-DK7d3EEl.js";import{C as r,a as n,b as l,d,c as b}from"./card-ofb_CR9y.js";import{T as M,a as H,b as h,c as x}from"./DualImageInput-pS5nvmsm.js";import{A as q,a as J,b as z,c as W}from"./accordion-DDqpPdII.js";import{B as P,Z as j,b as $,T as v,S as V,a as Y,C as T}from"./zap-DrzwwzUO.js";import{D as w}from"./database-B96-UJQc.js";import{G as A}from"./wallet-BKuXNt9_.js";import{S as E}from"./shield-CMXQ8S2a.js";import{A as B}from"./activity-BeZLYH2f.js";import{M as X}from"./maximize-2-CTTsj1jf.js";import{C}from"./trash-2-DC4Y-LtV.js";import{I as Q}from"./image-B0cfoO2W.js";import{I as Z}from"./info-CkB_Id0b.js";import{L as I}from"./layers-BUSrBR_P.js";import"./label-DZIhEbN8.js";import"./select-b1PPPYKl.js";import"./chevron-up-Cu_k3oqg.js";import"./subDays-BWRzlB5S.js";import"./index-BHwFVGGr.js";const N=({chart:o})=>{const m=g.useRef(null);return g.useEffect(()=>{let u=!0;if(m.current&&o){const p=i=>{!u||!m.current||(i.initialize({startOnLoad:!1,theme:"dark",securityLevel:"loose",fontFamily:"Inter, sans-serif",themeVariables:{primaryColor:"#0ea5e9",primaryTextColor:"#fff",primaryBorderColor:"#0ea5e9",lineColor:"#cbd5e1",secondaryColor:"#1e293b",tertiaryColor:"#334155"}}),m.current.removeAttribute("data-processed"),typeof i.run=="function"?i.run({nodes:[m.current]}).catch(t=>console.error(t)):typeof i.contentLoaded=="function"&&i.contentLoaded())};if(window.mermaid)p(window.mermaid);else{const i="mermaid-cdn-script";let t=document.getElementById(i);t||(t=document.createElement("script"),t.id=i,t.src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js",t.async=!0,document.head.appendChild(t)),t.addEventListener("load",()=>{window.mermaid&&p(window.mermaid)})}}return()=>{u=!1}},[o]),e.jsx("div",{className:"mermaid-wrapper flex justify-center bg-muted/30 p-4 rounded-xl border overflow-auto min-h-[300px]",children:e.jsx("div",{className:"mermaid",ref:m,children:o},o)})},ee=[{module:"Auth",method:"POST",path:"/api/auth/login",auth:!1,description:"Autentikasi user dan dapatkan JWT.",requestBody:{username:"admin",password:"password123"},responseBody:{token:"jwt_hash...",user:{id:1,role:"admin"}}},{module:"Auth",method:"GET",path:"/api/auth/me",auth:!0,description:"Ambil profil user yang sedang login.",responseBody:{id:1,role:"superadmin",name:"John Doe"}},{module:"Auth",method:"POST",path:"/api/auth/logout",auth:!0,description:"Keluar dan hapus session."},{module:"Users",method:"GET",path:"/api/users",auth:!0,role:["admin"],description:"Ambil semua user/staff/author di aplikasi."},{module:"Users",method:"PUT",path:"/api/users/:id/role",auth:!0,role:["superadmin"],description:"Update role serta akses pengguna."},{module:"Admin",method:"GET",path:"/api/admin/stats",auth:!0,role:["admin","superadmin"],description:"Ambil statistik dashboard (Total santri, revenue, pendaftaran bulanan).",responseBody:{totalSantri:450,pendingPayments:12,revenue:5e7}},{module:"Admissions",method:"GET",path:"/api/admin/santri",auth:!0,description:"Daftar santri dengan pagination & filter komprehensif.",responseBody:{data:[],meta:{total:450,page:1}}},{module:"Admissions",method:"POST",path:"/api/admin/santri/bulk-action",auth:!0,description:"Aksi massal (Accept, Reject, Delete santri).",requestBody:{action:"accept",ids:[1,2,3]}},{module:"Admissions",method:"GET",path:"/api/admin/exam-schedules",auth:!0,description:"Manajemen jadwal seleksi masuk (ujian)."},{module:"Admissions",method:"POST",path:"/api/admin/exam-results",auth:!0,description:"Submit nilai tes akademik/lisan pendaftar baru."},{module:"Payments",method:"GET",path:"/api/admin/payments",auth:!0,description:"Daftar konfirmasi pembayaran masuk (uang pangkal/SPP)."},{module:"Payments",method:"PUT",path:"/api/admin/payments/:id/verify",auth:!0,description:"Verifikasi bayar santri.",requestBody:{status:"verified",catatan:"Diterima"}},{module:"Public",method:"GET",path:"/api/core/programs",auth:!1,description:"Ambil daftar jenjang pendidikan dan prodi."},{module:"Public",method:"GET",path:"/api/core/fasilitas",auth:!1,description:"Daftar fasilitas pesantren."},{module:"Public",method:"GET",path:"/api/core/ekstrakurikuler",auth:!1,description:"Data ekstrakurikuler yang aktif."},{module:"Public",method:"GET",path:"/api/core/tenaga-pengajar",auth:!1,description:"Direktori asatidz dan ustadz."},{module:"Public",method:"GET",path:"/api/core/jadwal-harian",auth:!1,description:"Daftar rincian aktivitas keseharian."},{module:"PSB",method:"POST",path:"/api/psb/register",auth:!1,description:"Form registrasi santri.",requestBody:{namaLengkap:"...",nik:"..."}},{module:"PSB",method:"POST",path:"/api/psb/payment",auth:!1,description:"Upload bukti transfer dari pihak calon wali santri."},{module:"PSB",method:"GET",path:"/api/psb/status/:nisn",auth:!1,description:"Cek status penerimaan secara publik menggunakan NISN/NIK."},{module:"Publikasi",method:"GET",path:"/api/publication/articles",auth:!1,description:"Daftar manuskrip / artikel ilmiah terpublikasi."},{module:"Publikasi",method:"POST",path:"/api/publication/author/articles",auth:!0,role:["author"],description:"Submit karya ilmiah untuk masuk radar review."},{module:"Publikasi",method:"PUT",path:"/api/publication/admin/articles/:id/approve",auth:!0,role:["editor"],description:"Proses peer-review approval."},{module:"Publikasi",method:"GET",path:"/api/publication/volumes",auth:!1,description:"Arsip e-Journal per volume & edisi."},{module:"Blog",method:"GET",path:"/api/blog/posts",auth:!1,description:"Feed berita pesantren, artikel, tausiyah."},{module:"Blog",method:"POST",path:"/api/admin/blog/posts",auth:!0,description:"Publikasi konten berita via WYSIWYG editor."},{module:"Blog",method:"GET",path:"/api/blog/pengumuman",auth:!1,description:"Pengumuman krusial berbatas waktu (slider)."},{module:"Media",method:"POST",path:"/api/upload",auth:!0,description:"Cloud upload gateway (ImageKit/Cloudinary fallback)."},{module:"Media",method:"GET",path:"/api/media/files",auth:!0,description:"File Management API (Asset library)."},{module:"Generic",method:"GET",path:"/api/admin/generic/:resource",auth:!0,description:"Endpoint sakti untuk 30+ tabel secara generik (websitesettings, founders, dll)."},{module:"Generic",method:"POST",path:"/api/admin/generic/:resource",auth:!0,description:"Dynamic record insert."},{module:"Generic",method:"PUT",path:"/api/admin/generic/:resource/:id",auth:!0,description:"Dynamic record update."}];function ye(){const[o,m]=g.useState(""),[u,p]=g.useState(null),i=g.useMemo(()=>ee.filter(a=>a.path.toLowerCase().includes(o.toLowerCase())||a.description.toLowerCase().includes(o.toLowerCase())||a.module.toLowerCase().includes(o.toLowerCase())),[o]),t=(a,s)=>{navigator.clipboard.writeText(a),p(s),D({title:"Copied!",description:"Perintah berhasil disalin ke clipboard."}),setTimeout(()=>p(null),2e3)},_=a=>{const s=`https://api.pesantrehub.com${a.path}`;let c=`curl -X ${a.method} "${s}" \\
  -H "Content-Type: application/json"`;return a.auth&&(c+=` \\
  -H "Authorization: Bearer YOUR_TOKEN"`),a.requestBody&&(c+=` \\
  -d '${JSON.stringify(a.requestBody,null,2)}'`),c},O=a=>{const s=`https://api.pesantrehub.com${a.path}`,c={method:a.method,headers:{"Content-Type":"application/json"}};return a.auth&&(c.headers.Authorization="Bearer YOUR_TOKEN"),a.requestBody&&(c.body="JSON.stringify(data)"),`fetch("${s}", ${JSON.stringify(c,null,2).replace('"JSON.stringify(data)"',"JSON.stringify(payload)")});`};return e.jsxs("div",{className:"space-y-6 animate-fade-in pb-20",children:[e.jsx(F,{title:"Dokumentasi Sistem",description:"Pusat informasi teknis, skema database, dan referensi API Premium (Zero-Latency Ready)",icon:P}),e.jsxs(M,{defaultValue:"architecture",className:"space-y-6",children:[e.jsxs(H,{className:"grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-muted/50 border backdrop-blur-sm sticky top-0 z-10 shadow-sm",children:[e.jsxs(h,{value:"architecture",className:"py-2.5",children:[e.jsx(j,{className:"mr-2 h-4 w-4"})," Arsitektur"]}),e.jsxs(h,{value:"database",className:"py-2.5",children:[e.jsx(w,{className:"mr-2 h-4 w-4"})," Database (ERD)"]}),e.jsxs(h,{value:"usecase",className:"py-2.5",children:[e.jsx($,{className:"mr-2 h-4 w-4"})," Alur Bisnis"]}),e.jsxs(h,{value:"api",className:"py-2.5",children:[e.jsx(v,{className:"mr-2 h-4 w-4"})," API Explorer"]}),e.jsxs(h,{value:"maintenance",className:"py-2.5",children:[e.jsx(V,{className:"mr-2 h-4 w-4"})," Pemeliharaan"]})]}),e.jsxs(x,{value:"architecture",className:"space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500",children:[e.jsxs("div",{className:"grid gap-6 md:grid-cols-3",children:[e.jsxs(r,{className:"relative overflow-hidden group border-primary/20 bg-gradient-to-br from-primary/5 to-transparent",children:[e.jsx("div",{className:"absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform",children:e.jsx(j,{className:"h-16 w-16"})}),e.jsx(n,{children:e.jsx(l,{className:"flex items-center text-primary",children:"Zero-Latency Engine"})}),e.jsxs(d,{className:"text-sm text-muted-foreground",children:["Kami mengimplementasikan ",e.jsx("strong",{children:"Predictive Prefetching"}),". Saat sistem mendeteksi aktivitas admin, data-data kritikal dimuat ke dalam memori ",e.jsx("em",{children:"(L1 Cache)"})," sebelum admin membukanya."]})]}),e.jsxs(r,{className:"relative overflow-hidden group border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-transparent",children:[e.jsx("div",{className:"absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform",children:e.jsx(A,{className:"h-16 w-16"})}),e.jsx(n,{children:e.jsx(l,{className:"flex items-center text-sky-500",children:"Edge Logic Flow"})}),e.jsxs(d,{className:"text-sm text-muted-foreground",children:["Seluruh logika bisnis dideploy di ",e.jsx("strong",{children:"Vercel Edge Network"}),". Ini meminimalkan jarak antara database Neon (Frankfurt/Singapore) dengan admin di Indonesia."]})]}),e.jsxs(r,{className:"relative overflow-hidden group border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent",children:[e.jsx("div",{className:"absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform",children:e.jsx(E,{className:"h-16 w-16"})}),e.jsx(n,{children:e.jsx(l,{className:"flex items-center text-emerald-500",children:"RBAC Security"})}),e.jsxs(d,{className:"text-sm text-muted-foreground",children:[e.jsx("em",{children:"Role-Based Access Control"})," yang ketat. Middleware Hono memverifikasi peran (Admin, Bendahara, Author) pada setiap request di level server."]})]})]}),e.jsxs(r,{className:"border-none shadow-xl bg-slate-900 text-white overflow-hidden",children:[e.jsx(n,{className:"border-b border-white/10",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsxs(l,{className:"text-xl flex items-center gap-2",children:[e.jsx(B,{className:"h-5 w-5 text-emerald-400"})," System Integration Flow"]}),e.jsx(b,{className:"text-slate-400",children:"Visualisasi komunikasi asinkron antar komponen"})]}),e.jsx(f,{variant:"outline",className:"text-emerald-400 border-emerald-400/30",children:"Stable v1.2"})]})}),e.jsx(d,{className:"p-8",children:e.jsx(N,{chart:`
                graph LR
                  %% Nodes
                  FB[Vite Frontend]
                  API[Hono Edge API]
                  DB[(Neon Serverless)]
                  STORAGE[ImageKit Storage]
                  WH[WhatsApp Hook]
                  
                  %% Flows
                  FB -- "GraphQL-like REST" --> API
                  API -- "Drizzle ORM" --> DB
                  API -- "Storage API" --> STORAGE
                  API -- "Trigger Notification" --> WH
                  
                  %% Styles
                  style FB fill:#0ea5e9,stroke:#fff,stroke-width:2px,color:#fff
                  style API fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
                  style DB fill:#6366f1,stroke:#fff,stroke-width:2px,color:#fff
                  style STORAGE fill:#f59e0b,stroke:#fff,stroke-width:2px,color:#fff
                  style WH fill:#25d366,stroke:#fff,stroke-width:2px,color:#fff
              `})})]})]}),e.jsxs(x,{value:"database",className:"space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500",children:[e.jsxs(r,{className:"border-none shadow-2xl bg-[#0b1120] text-slate-300",children:[e.jsx(n,{className:"border-b border-white/5 bg-white/5",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs(l,{className:"flex items-center gap-2 text-white",children:[e.jsx(w,{className:"h-5 w-5 text-amber-400"})," Super ERD (Entity Relationship Diagram)"]}),e.jsx("div",{className:"flex gap-2",children:e.jsxs(k,{variant:"ghost",size:"sm",className:"text-slate-400 hover:text-white",children:[e.jsx(X,{className:"h-4 w-4 mr-2"})," Fullscreen"]})})]})}),e.jsx(d,{className:"p-0 overflow-auto max-h-[70vh] custom-scrollbar",children:e.jsx("div",{className:"p-10 min-w-[1200px]",children:e.jsx(N,{chart:`
                  erDiagram
                    %% Core Configs & Settings
                    CORE_WEBSITESETTINGS {
                        int id PK
                        string nama_pondok
                        string hero_title
                    }
                    CORE_PROGRAMS {
                        int id PK
                        string slug UK
                        string nama
                    }
                    CORE_FASILITAS {
                        int id PK
                        string nama
                    }
                    CORE_JADWAL {
                        int id PK
                        string kegiatan
                    }

                    %% Core Users
                    USERS {
                        int id PK
                        string username UK
                        string role "admin|staff|author"
                    }
                    NOTIFICATIONS {
                        int id PK
                        int user_id FK
                        string message
                    }
                    USERS ||--o{ NOTIFICATIONS : "receive"
                    USER_LOGIN_HISTORY {
                        int id PK
                        int user_id FK
                    }
                    USERS ||--o{ USER_LOGIN_HISTORY : "tracks"
                    
                    %% Admissions / PSB
                    SANTRI {
                        int id PK
                        string nisn UK
                        string nama_lengkap
                        string status "pending|accepted|rejected"
                    }
                    PARENTS {
                        int id PK
                        string nik UK
                        string nama
                    }
                    SANTRI }|--|{ PARENTS : "anak_dari"
                    
                    EXAM_SCHEDULES {
                        int id PK
                        timestamp tanggal
                    }
                    EXAM_RESULTS {
                        int id PK
                        int santri_id FK
                        int schedule_id FK
                        decimal nilai_akhir
                    }
                    SANTRI ||--o| EXAM_RESULTS : "memiliki"
                    EXAM_SCHEDULES ||--o{ EXAM_RESULTS : "menyelenggarakan"
                    
                    %% Payments
                    PAYMENTS {
                        int id PK
                        int santri_id FK
                        decimal jumlah
                        string status "pending|verified"
                    }
                    BANK_ACCOUNTS {
                        int id PK
                        string nomor_rekening
                    }
                    SANTRI ||--o{ PAYMENTS : "bayar"
                    PAYMENTS }|--|| BANK_ACCOUNTS : "via"

                    %% Publication (Jurnal)
                    PUB_ARTICLES {
                        int id PK
                        string title
                        string status "draft|approved"
                        int author_id FK
                        int volume_id FK
                    }
                    PUB_VOLUMES {
                        int id PK
                        string name
                    }
                    PUB_CATEGORIES {
                        int id PK
                        string name
                    }
                    USERS ||--o{ PUB_ARTICLES : "menulis"
                    PUB_ARTICLES }|--|| PUB_VOLUMES : "termasuk"
                    PUB_ARTICLES }|--|| PUB_CATEGORIES : "dikategorikan_dalam"
                    
                    %% CMS / Blog
                    BLOG_POSTS {
                        int id PK
                        string title
                        int author_id FK
                        int category_id FK
                    }
                    BLOG_CATEGORIES {
                        int id PK
                        string name
                    }
                    TAGS {
                        int id PK
                        string slug UK
                    }
                    USERS ||--o{ BLOG_POSTS : "write"
                    BLOG_POSTS }|--|| BLOG_CATEGORIES : "jenis"
                    BLOG_POSTS }|--|{ TAGS : "berisi"
                    
                    %% Media Files
                    MEDIA_FILES {
                        int id PK
                        string url
                        string type
                    }
                    USERS ||--o{ MEDIA_FILES : "upload"
                `})})}),e.jsxs("div",{className:"p-4 border-t border-white/5 text-[10px] text-slate-500 uppercase tracking-widest flex gap-4 bg-black/20",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-amber-400"})," PK: Primary Key"]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-blue-400"})," FK: Foreign Key"]}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400"})," UK: Unique Key"]})]})]}),e.jsx("div",{className:"grid gap-6 md:grid-cols-4",children:[{title:"Identity & Auth",tables:"users_user, loginhistory, notifications, system_settings",icon:R,color:"text-blue-500"},{title:"Public Settings (Core)",tables:"core_websitesettings, core_herosection, core_faq, core_visimisi, struktur_organisasi",icon:A,color:"text-sky-500"},{title:"Academics & Info",tables:"core_program, core_fasilitas, core_ekstrakurikuler, core_tenagapengajar, core_jadwalharian",icon:P,color:"text-indigo-500"},{title:"Admissions (PSB)",tables:"admissions_santri, parents, exam_schedules, exam_results",icon:G,color:"text-emerald-500"},{title:"Financials",tables:"payments_payment, bankaccount, core_biayapendidikan",icon:K,color:"text-amber-500"},{title:"Blog & Information",tables:"blog_blogpost, blog_category, blog_tag, blog_pengumuman, testimoni",icon:C,color:"text-purple-500"},{title:"Publications",tables:"publication_articles, volumes, collaborations, categories",icon:Y,color:"text-rose-500"},{title:"Media & Docs Manager",tables:"media_files, media_accounts, document_templates",icon:Q,color:"text-teal-500"}].map((a,s)=>e.jsxs(r,{className:"border-none shadow-md hover:shadow-lg transition-all cursor-default",children:[e.jsx(n,{className:"pb-2",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a.icon,{className:y("h-5 w-5",a.color)}),e.jsx(l,{className:"text-sm font-bold",children:a.title})]})}),e.jsx(d,{children:e.jsx("p",{className:"text-[9px] leading-relaxed uppercase text-muted-foreground font-semibold line-clamp-3",children:a.tables})})]},s))})]}),e.jsx(x,{value:"usecase",className:"space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500",children:e.jsxs("div",{className:"grid gap-6 lg:grid-cols-2",children:[e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsxs(l,{className:"flex items-center gap-2",children:[e.jsx(B,{className:"h-5 w-5 text-primary"})," Alur PSB & Pembayaran"]}),e.jsx(b,{children:"Proses dari pendaftaran hingga diterima sebagai santri"})]}),e.jsx(d,{children:e.jsx(N,{chart:`
                  sequenceDiagram
                    participant P as Pendaftar (Publik)
                    participant B as Backend (PSB API)
                    participant A as Admin (Bendahara/Staf)
                    
                    P->>B: Submit Form & Pilih Bank
                    B->>P: Dapatkan Santri ID & Instruksi Bayar
                    P->>B: Upload Bukti Transfer (.jpg/pdf)
                    B->>A: Notifikasi "Pembayaran Baru"
                    A->>B: Cek Rekening & Klik 'Verify'
                    B->>P: Status Update: 'Accepted' (Auto SMS/WA)
                `})})]}),e.jsxs(r,{children:[e.jsxs(n,{children:[e.jsxs(l,{className:"flex items-center gap-2",children:[e.jsx(j,{className:"h-5 w-5 text-amber-500"})," Alur Publikasi Ilmiah"]}),e.jsx(b,{children:"Kolaborasi antara Penulis dan Editor Jurnal"})]}),e.jsx(d,{children:e.jsx(N,{chart:`
                  graph TD
                    T1[Penulis Submit Naskah] --> T2[Review Internal Staf]
                    T2 -- "Butuh Revisi" --> T1
                    T2 -- "Lolos" --> T3[Editor Menentukan Volume]
                    T3 --> T4[Publikasi di Website]
                    T4 --> T5[Prefetch Otomatis di Panel Admin]
                `})})]})]})}),e.jsx(x,{value:"api",className:"space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500",children:e.jsxs(r,{className:"border-none shadow-xl",children:[e.jsx(n,{className:"bg-muted/30 pb-6 border-b",children:e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-4",children:[e.jsxs("div",{children:[e.jsxs(l,{className:"text-2xl flex items-center gap-2",children:[e.jsx(v,{className:"h-6 w-6 text-primary"})," API Explorer"]}),e.jsx(b,{children:"Daftar lengkap endpoint Pesantren-Hub API v1.0"})]}),e.jsxs("div",{className:"relative w-full md:w-96",children:[e.jsx(L,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}),e.jsx(U,{placeholder:"Cari endpoint, modul, atau fungsi...",className:"pl-10",value:o,onChange:a=>m(a.target.value)})]})]})}),e.jsx(d,{className:"p-0",children:e.jsx(q,{type:"single",collapsible:!0,className:"w-full",children:i.length===0?e.jsxs("div",{className:"text-center py-20 text-muted-foreground",children:[e.jsx(T,{className:"h-12 w-12 mx-auto opacity-10 mb-4"}),e.jsx("p",{children:"Tidak ada API yang cocok dengan pencarian Anda."})]}):i.map((a,s)=>e.jsxs(J,{value:`item-${s}`,className:"border-b last:border-0 hover:bg-muted/10 transition-colors",children:[e.jsx(z,{className:"px-6 py-4 hover:no-underline font-mono",children:e.jsxs("div",{className:"flex items-center gap-4 text-left w-full overflow-hidden",children:[e.jsx(f,{className:y("w-16 justify-center shrink-0",a.method==="GET"?"bg-sky-500 hover:bg-sky-600":a.method==="POST"?"bg-emerald-500 hover:bg-emerald-600":a.method==="DELETE"?"bg-rose-500 hover:bg-rose-600":"bg-amber-500 hover:bg-amber-600"),children:a.method}),e.jsx("span",{className:"font-bold text-xs md:text-sm truncate max-w-[400px]",children:a.path}),e.jsx(f,{variant:"outline",className:"ml-auto hidden md:flex opacity-70 border-primary/30 text-primary",children:a.module}),a.auth&&e.jsx(E,{className:"h-3 w-3 text-emerald-500 shrink-0"})]})}),e.jsx(W,{className:"px-6 pb-6 pt-2 bg-muted/5",children:e.jsxs("div",{className:"grid lg:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsxs("h6",{className:"text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-1",children:[e.jsx(Z,{className:"h-3 w-3"})," Deskripsi"]}),e.jsx("p",{className:"text-sm text-foreground/80 leading-relaxed",children:a.description})]}),a.role&&e.jsxs("div",{className:"space-y-1",children:[e.jsx("h6",{className:"text-[10px] font-bold uppercase text-muted-foreground tracking-widest",children:"Hak Akses"}),e.jsx("div",{className:"flex gap-1",children:a.role.map(c=>e.jsx(f,{variant:"secondary",className:"text-[10px]",children:c},c))})]}),e.jsxs("div",{className:"flex gap-4 pt-2",children:[e.jsxs(k,{size:"sm",variant:"outline",className:"h-8 text-xs gap-2",onClick:()=>t(_(a),`curl-${s}`),children:[u===`curl-${s}`?e.jsx(S,{className:"h-3 w-3 text-emerald-500"}):e.jsx(C,{className:"h-3 w-3"}),"Copy cURL"]}),e.jsxs(k,{size:"sm",variant:"outline",className:"h-8 text-xs gap-2",onClick:()=>t(O(a),`fetch-${s}`),children:[u===`fetch-${s}`?e.jsx(S,{className:"h-3 w-3 text-emerald-500"}):e.jsx(I,{className:"h-3 w-3"}),"Copy Fetch"]})]})]}),e.jsxs("div",{className:"space-y-4",children:[a.requestBody&&e.jsxs("div",{className:"space-y-1",children:[e.jsx("h6",{className:"text-[10px] font-bold uppercase text-muted-foreground tracking-widest",children:"Sample Payload"}),e.jsx("pre",{className:"p-3 rounded-lg bg-black text-emerald-400 text-[10px] font-mono overflow-auto border border-emerald-900/30",children:JSON.stringify(a.requestBody,null,2)})]}),a.responseBody&&e.jsxs("div",{className:"space-y-1",children:[e.jsx("h6",{className:"text-[10px] font-bold uppercase text-muted-foreground tracking-widest",children:"Success Response"}),e.jsx("pre",{className:"p-3 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-mono overflow-auto border shadow-inner",children:JSON.stringify(a.responseBody,null,2)})]})]})]})})]},s))})})]})}),e.jsx(x,{value:"maintenance",className:"space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500",children:e.jsxs("div",{className:"grid gap-6 md:grid-cols-2",children:[e.jsxs(r,{className:"border-l-4 border-l-primary",children:[e.jsx(n,{children:e.jsx(l,{className:"text-lg",children:"Ekstensi Modul"})}),e.jsxs(d,{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Sistem dirancang modular. Untuk menambah fitur baru:"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex gap-4 items-start",children:[e.jsx("div",{className:"h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1",children:e.jsx("span",{className:"text-xs font-bold",children:"1"})}),e.jsxs("div",{className:"text-xs",children:[e.jsx("p",{className:"font-bold",children:"Skema Database"}),e.jsxs("p",{className:"opacity-70",children:["Tambahkan ",e.jsx("code",{children:"pgTable"})," baru di ",e.jsx("code",{children:"server/src/db/schema.ts"}),"."]})]})]}),e.jsxs("div",{className:"flex gap-4 items-start",children:[e.jsx("div",{className:"h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1",children:e.jsx("span",{className:"text-xs font-bold",children:"2"})}),e.jsxs("div",{className:"text-xs",children:[e.jsx("p",{className:"font-bold",children:"Generic CRUD"}),e.jsxs("p",{className:"opacity-70",children:["Daftarkan tabel baru di ",e.jsx("code",{children:"adminGeneric.getTable"})," agar API otomatis terbentuk."]})]})]}),e.jsxs("div",{className:"flex gap-4 items-start",children:[e.jsx("div",{className:"h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1",children:e.jsx("span",{className:"text-xs font-bold",children:"3"})}),e.jsxs("div",{className:"text-xs",children:[e.jsx("p",{className:"font-bold",children:"UI Page"}),e.jsxs("p",{className:"opacity-70",children:["Gunakan ",e.jsx("code",{children:"BaseResourceList"})," di frontend untuk integrasi instan."]})]})]})]})]})]}),e.jsxs(r,{className:"border-l-4 border-l-amber-500",children:[e.jsx(n,{children:e.jsx(l,{className:"text-lg",children:"Tips Performa"})}),e.jsxs(d,{className:"space-y-4 text-sm",children:[e.jsxs("div",{className:"p-3 rounded-lg bg-amber-500/5 border border-amber-500/20",children:[e.jsxs("p",{className:"font-bold text-amber-600 mb-1 flex items-center gap-1",children:[e.jsx(j,{className:"h-3 w-3"})," Eager Loading"]}),e.jsxs("p",{className:"text-xs opacity-80",children:["Gunakan hook ",e.jsx("code",{children:"useAdminPrefetch"})," untuk memuat data menu samping sebelum diklik. Ini menghilangkan loading spinner di mata admin."]})]}),e.jsxs("div",{className:"p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20",children:[e.jsxs("p",{className:"font-bold text-emerald-600 mb-1 flex items-center gap-1",children:[e.jsx(I,{className:"h-3 w-3"})," TanStack Query"]}),e.jsxs("p",{className:"text-xs opacity-80",children:["Atur ",e.jsx("code",{children:"staleTime"})," tinggi (5-10 menit) untuk data yang jarang berubah seperti Pengaturan Website."]})]})]})]})]})})]}),e.jsxs("div",{className:"flex justify-center items-center gap-4 text-xs text-muted-foreground opacity-50 py-10",children:[e.jsx(T,{className:"h-3 w-3"}),e.jsx("span",{children:"Pesantren-Hub Engineered with ❤️ for Zero-Latency Performance"}),e.jsx("div",{className:"w-1 h-1 rounded-full bg-muted-foreground"}),e.jsx("span",{children:"v1.0.0 Stable"})]})]})}export{ye as default};
