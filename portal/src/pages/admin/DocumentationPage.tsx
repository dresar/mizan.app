import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { 
  Book, Database, Server, Smartphone, ShieldCheck, Zap, Code, 
  Terminal, Layers, Search, Copy, Check, ChevronRight, 
  ArrowRight, Activity, Users, CreditCard, Shield, Globe, 
  FileText, ImageIcon, Settings, MessageSquare, Info,
  ExternalLink, Maximize2, Bookmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from '@/components/ui/use-toast';
import Mermaid from '@/components/common/Mermaid';
import { cn } from '@/lib/utils';

// --- API DATA DEFINITION ---
interface APIEndpoint {
  module: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  auth: boolean;
  role?: string[];
  description: string;
  requestBody?: any;
  responseBody?: any;
}

const API_CATALOG: APIEndpoint[] = [
  // AUTH & USERS
  { module: 'Auth', method: 'POST', path: '/api/auth/login', auth: false, description: 'Autentikasi user dan dapatkan JWT.', requestBody: { username: 'admin', password: 'password123' }, responseBody: { token: 'jwt_hash...', user: { id: 1, role: 'admin' } } },
  { module: 'Auth', method: 'GET', path: '/api/auth/me', auth: true, description: 'Ambil profil user yang sedang login.', responseBody: { id: 1, role: 'superadmin', name: 'John Doe' } },
  { module: 'Auth', method: 'POST', path: '/api/auth/logout', auth: true, description: 'Keluar dan hapus session.' },
  { module: 'Users', method: 'GET', path: '/api/users', auth: true, role: ['admin'], description: 'Ambil semua user/staff/author di aplikasi.' },
  { module: 'Users', method: 'PUT', path: '/api/users/:id/role', auth: true, role: ['superadmin'], description: 'Update role serta akses pengguna.' },

  // ADMIN - CORE DASHBOARD
  { module: 'Admin', method: 'GET', path: '/api/admin/stats', auth: true, role: ['admin', 'superadmin'], description: 'Ambil statistik dashboard (Total santri, revenue, pendaftaran bulanan).', responseBody: { totalSantri: 450, pendingPayments: 12, revenue: 50000000 } },

  // ADMIN - ADMISSIONS (PSB)
  { module: 'Admissions', method: 'GET', path: '/api/admin/santri', auth: true, description: 'Daftar santri dengan pagination & filter komprehensif.', responseBody: { data: [], meta: { total: 450, page: 1 } } },
  { module: 'Admissions', method: 'POST', path: '/api/admin/santri/bulk-action', auth: true, description: 'Aksi massal (Accept, Reject, Delete santri).', requestBody: { action: 'accept', ids: [1, 2, 3] } },
  { module: 'Admissions', method: 'GET', path: '/api/admin/exam-schedules', auth: true, description: 'Manajemen jadwal seleksi masuk (ujian).' },
  { module: 'Admissions', method: 'POST', path: '/api/admin/exam-results', auth: true, description: 'Submit nilai tes akademik/lisan pendaftar baru.' },

  // ADMIN - PAYMENTS
  { module: 'Payments', method: 'GET', path: '/api/admin/payments', auth: true, description: 'Daftar konfirmasi pembayaran masuk (uang pangkal/SPP).' },
  { module: 'Payments', method: 'PUT', path: '/api/admin/payments/:id/verify', auth: true, description: 'Verifikasi bayar santri.', requestBody: { status: 'verified', catatan: 'Diterima' } },

  // WEBSITE / PUBLIC API (CORE)
  { module: 'Public', method: 'GET', path: '/api/core/programs', auth: false, description: 'Ambil daftar jenjang pendidikan dan prodi.' },
  { module: 'Public', method: 'GET', path: '/api/core/fasilitas', auth: false, description: 'Daftar fasilitas pesantren.' },
  { module: 'Public', method: 'GET', path: '/api/core/ekstrakurikuler', auth: false, description: 'Data ekstrakurikuler yang aktif.' },
  { module: 'Public', method: 'GET', path: '/api/core/tenaga-pengajar', auth: false, description: 'Direktori asatidz dan ustadz.' },
  { module: 'Public', method: 'GET', path: '/api/core/jadwal-harian', auth: false, description: 'Daftar rincian aktivitas keseharian.' },

  // PUBLIC / PSB (REGISTRASI)
  { module: 'PSB', method: 'POST', path: '/api/psb/register', auth: false, description: 'Form registrasi santri.', requestBody: { namaLengkap: '...', nik: '...' } },
  { module: 'PSB', method: 'POST', path: '/api/psb/payment', auth: false, description: 'Upload bukti transfer dari pihak calon wali santri.' },
  { module: 'PSB', method: 'GET', path: '/api/psb/status/:nisn', auth: false, description: 'Cek status penerimaan secara publik menggunakan NISN/NIK.' },

  // PUBLICATION (JURNAL)
  { module: 'Publikasi', method: 'GET', path: '/api/publication/articles', auth: false, description: 'Daftar manuskrip / artikel ilmiah terpublikasi.' },
  { module: 'Publikasi', method: 'POST', path: '/api/publication/author/articles', auth: true, role: ['author'], description: 'Submit karya ilmiah untuk masuk radar review.' },
  { module: 'Publikasi', method: 'PUT', path: '/api/publication/admin/articles/:id/approve', auth: true, role: ['editor'], description: 'Proses peer-review approval.' },
  { module: 'Publikasi', method: 'GET', path: '/api/publication/volumes', auth: false, description: 'Arsip e-Journal per volume & edisi.' },

  // BLOG & PENGUMUMAN
  { module: 'Blog', method: 'GET', path: '/api/blog/posts', auth: false, description: 'Feed berita pesantren, artikel, tausiyah.' },
  { module: 'Blog', method: 'POST', path: '/api/admin/blog/posts', auth: true, description: 'Publikasi konten berita via WYSIWYG editor.' },
  { module: 'Blog', method: 'GET', path: '/api/blog/pengumuman', auth: false, description: 'Pengumuman krusial berbatas waktu (slider).' },

  // MEDIA FILES
  { module: 'Media', method: 'POST', path: '/api/upload', auth: true, description: 'Cloud upload gateway (ImageKit/Cloudinary fallback).' },
  { module: 'Media', method: 'GET', path: '/api/media/files', auth: true, description: 'File Management API (Asset library).' },

  // GENERIC ADMIN CRUD
  { module: 'Generic', method: 'GET', path: '/api/admin/generic/:resource', auth: true, description: 'Endpoint sakti untuk 30+ tabel secara generik (websitesettings, founders, dll).' },
  { module: 'Generic', method: 'POST', path: '/api/admin/generic/:resource', auth: true, description: 'Dynamic record insert.' },
  { module: 'Generic', method: 'PUT', path: '/api/admin/generic/:resource/:id', auth: true, description: 'Dynamic record update.' },
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAPI = useMemo(() => {
    return API_CATALOG.filter(api => 
      api.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
      api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.module.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Perintah berhasil disalin ke clipboard." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCurl = (api: APIEndpoint) => {
    const url = `https://api.pesantrehub.com${api.path}`;
    let curl = `curl -X ${api.method} "${url}" \\\n  -H "Content-Type: application/json"`;
    if (api.auth) curl += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;
    if (api.requestBody) curl += ` \\\n  -d '${JSON.stringify(api.requestBody, null, 2)}'`;
    return curl;
  };

  const getFetch = (api: APIEndpoint) => {
    const url = `https://api.pesantrehub.com${api.path}`;
    const options: any = {
      method: api.method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (api.auth) options.headers['Authorization'] = 'Bearer YOUR_TOKEN';
    if (api.requestBody) options.body = 'JSON.stringify(data)';
    
    return `fetch("${url}", ${JSON.stringify(options, null, 2).replace('"JSON.stringify(data)"', 'JSON.stringify(payload)')});`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader 
        title="Dokumentasi Sistem" 
        description="Pusat informasi teknis, skema database, dan referensi API Premium (Zero-Latency Ready)" 
        icon={Book} 
      />

      <Tabs defaultValue="architecture" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-muted/50 border backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <TabsTrigger value="architecture" className="py-2.5">
            <Zap className="mr-2 h-4 w-4" /> Arsitektur
          </TabsTrigger>
          <TabsTrigger value="database" className="py-2.5">
            <Database className="mr-2 h-4 w-4" /> Database (ERD)
          </TabsTrigger>
          <TabsTrigger value="usecase" className="py-2.5">
            <Smartphone className="mr-2 h-4 w-4" /> Alur Bisnis
          </TabsTrigger>
          <TabsTrigger value="api" className="py-2.5">
            <Terminal className="mr-2 h-4 w-4" /> API Explorer
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="py-2.5">
            <ShieldCheck className="mr-2 h-4 w-4" /> Pemeliharaan
          </TabsTrigger>
        </TabsList>

        {/* --- 1. ARSITEKTUR --- */}
        <TabsContent value="architecture" className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid gap-6 md:grid-cols-3">
             <Card className="relative overflow-hidden group border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Zap className="h-16 w-16" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">Zero-Latency Engine</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Kami mengimplementasikan <strong>Predictive Prefetching</strong>. Saat sistem mendeteksi aktivitas admin, 
                  data-data kritikal dimuat ke dalam memori <em>(L1 Cache)</em> sebelum admin membukanya.
                </CardContent>
             </Card>
             <Card className="relative overflow-hidden group border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Globe className="h-16 w-16" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center text-sky-500">Edge Logic Flow</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Seluruh logika bisnis dideploy di <strong>Vercel Edge Network</strong>. 
                  Ini meminimalkan jarak antara database Neon (Frankfurt/Singapore) dengan admin di Indonesia.
                </CardContent>
             </Card>
             <Card className="relative overflow-hidden group border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Shield className="h-16 w-16" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-500">RBAC Security</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <em>Role-Based Access Control</em> yang ketat. Middleware Hono memverifikasi 
                  peran (Admin, Bendahara, Author) pada setiap request di level server.
                </CardContent>
             </Card>
          </div>

          <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" /> System Integration Flow
                  </CardTitle>
                  <CardDescription className="text-slate-400">Visualisasi komunikasi asinkron antar komponen</CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">Stable v1.2</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Mermaid chart={`
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
              `} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 2. DATABASE / ERD --- */}
        <TabsContent value="database" className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
           <Card className="border-none shadow-2xl bg-[#0b1120] text-slate-300">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Database className="h-5 w-5 text-amber-400" /> Super ERD (Entity Relationship Diagram)
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Maximize2 className="h-4 w-4 mr-2" /> Fullscreen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto max-h-[70vh] custom-scrollbar">
              <div className="p-10 min-w-[1200px]">
                <Mermaid chart={`
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
                `} />
              </div>
            </CardContent>
            <div className="p-4 border-t border-white/5 text-[10px] text-slate-500 uppercase tracking-widest flex gap-4 bg-black/20">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> PK: Primary Key</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> FK: Foreign Key</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> UK: Unique Key</span>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-4">
              {[
                { title: 'Identity & Auth', tables: 'users_user, loginhistory, notifications, system_settings', icon: Users, color: 'text-blue-500' },
                { title: 'Public Settings (Core)', tables: 'core_websitesettings, core_herosection, core_faq, core_visimisi, struktur_organisasi', icon: Globe, color: 'text-sky-500' },
                { title: 'Academics & Info', tables: 'core_program, core_fasilitas, core_ekstrakurikuler, core_tenagapengajar, core_jadwalharian', icon: Book, color: 'text-indigo-500' },
                { title: 'Admissions (PSB)', tables: 'admissions_santri, parents, exam_schedules, exam_results', icon: FileText, color: 'text-emerald-500' },
                { title: 'Financials', tables: 'payments_payment, bankaccount, core_biayapendidikan', icon: CreditCard, color: 'text-amber-500' },
                { title: 'Blog & Information', tables: 'blog_blogpost, blog_category, blog_tag, blog_pengumuman, testimoni', icon: Copy, color: 'text-purple-500' },
                { title: 'Publications', tables: 'publication_articles, volumes, collaborations, categories', icon: Bookmark, color: 'text-rose-500' },
                { title: 'Media & Docs Manager', tables: 'media_files, media_accounts, document_templates', icon: ImageIcon, color: 'text-teal-500' }
              ].map((group, i) => (
                <Card key={i} className="border-none shadow-md hover:shadow-lg transition-all cursor-default">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <group.icon className={cn("h-5 w-5", group.color)} />
                      <CardTitle className="text-sm font-bold">{group.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[9px] leading-relaxed uppercase text-muted-foreground font-semibold line-clamp-3">{group.tables}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* --- 3. ALUR BISNIS --- */}
        <TabsContent value="usecase" className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Alur PSB & Pembayaran
                </CardTitle>
                <CardDescription>Proses dari pendaftaran hingga diterima sebagai santri</CardDescription>
              </CardHeader>
              <CardContent>
                <Mermaid chart={`
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
                `} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" /> Alur Publikasi Ilmiah
                </CardTitle>
                <CardDescription>Kolaborasi antara Penulis dan Editor Jurnal</CardDescription>
              </CardHeader>
              <CardContent>
                <Mermaid chart={`
                  graph TD
                    T1[Penulis Submit Naskah] --> T2[Review Internal Staf]
                    T2 -- "Butuh Revisi" --> T1
                    T2 -- "Lolos" --> T3[Editor Menentukan Volume]
                    T3 --> T4[Publikasi di Website]
                    T4 --> T5[Prefetch Otomatis di Panel Admin]
                `} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- 4. API EXPLORER --- */}
        <TabsContent value="api" className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
           <Card className="border-none shadow-xl">
            <CardHeader className="bg-muted/30 pb-6 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-primary" /> API Explorer
                  </CardTitle>
                  <CardDescription>Daftar lengkap endpoint Pesantren-Hub API v1.0</CardDescription>
                </div>
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cari endpoint, modul, atau fungsi..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Accordion type="single" collapsible className="w-full">
                  {filteredAPI.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto opacity-10 mb-4" />
                      <p>Tidak ada API yang cocok dengan pencarian Anda.</p>
                    </div>
                  ) : (
                    filteredAPI.map((api, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline font-mono">
                          <div className="flex items-center gap-4 text-left w-full overflow-hidden">
                            <Badge className={cn(
                              "w-16 justify-center shrink-0",
                              api.method === 'GET' ? 'bg-sky-500 hover:bg-sky-600' :
                              api.method === 'POST' ? 'bg-emerald-500 hover:bg-emerald-600' :
                              api.method === 'DELETE' ? 'bg-rose-500 hover:bg-rose-600' :
                              'bg-amber-500 hover:bg-amber-600'
                            )}>
                              {api.method}
                            </Badge>
                            <span className="font-bold text-xs md:text-sm truncate max-w-[400px]">{api.path}</span>
                            <Badge variant="outline" className="ml-auto hidden md:flex opacity-70 border-primary/30 text-primary">{api.module}</Badge>
                            {api.auth && <Shield className="h-3 w-3 text-emerald-500 shrink-0" />}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2 bg-muted/5">
                           <div className="grid lg:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <h6 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                                    <Info className="h-3 w-3" /> Deskripsi
                                  </h6>
                                  <p className="text-sm text-foreground/80 leading-relaxed">{api.description}</p>
                                </div>
                                {api.role && (
                                  <div className="space-y-1">
                                    <h6 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Hak Akses</h6>
                                    <div className="flex gap-1">
                                      {api.role.map(r => <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>)}
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-4 pt-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 text-xs gap-2"
                                    onClick={() => copyToClipboard(getCurl(api), `curl-${idx}`)}
                                  >
                                    {copiedId === `curl-${idx}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    Copy cURL
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 text-xs gap-2"
                                    onClick={() => copyToClipboard(getFetch(api), `fetch-${idx}`)}
                                  >
                                    {copiedId === `fetch-${idx}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Layers className="h-3 w-3" />}
                                    Copy Fetch
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-4">
                                {api.requestBody && (
                                   <div className="space-y-1">
                                     <h6 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Sample Payload</h6>
                                     <pre className="p-3 rounded-lg bg-black text-emerald-400 text-[10px] font-mono overflow-auto border border-emerald-900/30">
                                       {JSON.stringify(api.requestBody, null, 2)}
                                     </pre>
                                   </div>
                                )}
                                {api.responseBody && (
                                   <div className="space-y-1">
                                     <h6 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Success Response</h6>
                                     <pre className="p-3 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-mono overflow-auto border shadow-inner">
                                       {JSON.stringify(api.responseBody, null, 2)}
                                     </pre>
                                   </div>
                                )}
                              </div>
                           </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  )}
               </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 5. MAINTENANCE --- */}
        <TabsContent value="maintenance" className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
           <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-lg">Ekstensi Modul</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Sistem dirancang modular. Untuk menambah fitur baru:</p>
                  <div className="space-y-3">
                    <div className="flex gap-4 items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1"><span className="text-xs font-bold">1</span></div>
                      <div className="text-xs">
                        <p className="font-bold">Skema Database</p>
                        <p className="opacity-70">Tambahkan <code>pgTable</code> baru di <code>server/src/db/schema.ts</code>.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1"><span className="text-xs font-bold">2</span></div>
                      <div className="text-xs">
                        <p className="font-bold">Generic CRUD</p>
                        <p className="opacity-70">Daftarkan tabel baru di <code>adminGeneric.getTable</code> agar API otomatis terbentuk.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1"><span className="text-xs font-bold">3</span></div>
                      <div className="text-xs">
                        <p className="font-bold">UI Page</p>
                        <p className="opacity-70">Gunakan <code>BaseResourceList</code> di frontend untuk integrasi instan.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="text-lg">Tips Performa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                   <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                     <p className="font-bold text-amber-600 mb-1 flex items-center gap-1"><Zap className="h-3 w-3" /> Eager Loading</p>
                     <p className="text-xs opacity-80">Gunakan hook <code>useAdminPrefetch</code> untuk memuat data menu samping sebelum diklik. Ini menghilangkan loading spinner di mata admin.</p>
                   </div>
                   <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                     <p className="font-bold text-emerald-600 mb-1 flex items-center gap-1"><Layers className="h-3 w-3" /> TanStack Query</p>
                     <p className="text-xs opacity-80">Atur <code>staleTime</code> tinggi (5-10 menit) untuk data yang jarang berubah seperti Pengaturan Website.</p>
                   </div>
                </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground opacity-50 py-10">
        <Code className="h-3 w-3" />
        <span>Pesantren-Hub Engineered with ❤️ for Zero-Latency Performance</span>
        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>v1.0.0 Stable</span>
      </div>
    </div>
  );
}
