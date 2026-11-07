export interface DemoUser {
  username: string;
  name: string;
  role: string;
  roleTitle: string;
  gender?: string | null;
}

export const ALL_DEMO_USERS: DemoUser[] = [
  {
    username: "adminwebsite",
    name: "Admin Website Profil (CMS)",
    role: "adminwebsite",
    roleTitle: "Pengelola Berita & Profil",
    gender: null
  },
  {
    username: "penulis",
    name: "Ust. Penulis Jurnal & Artikel",
    role: "author",
    roleTitle: "Penulis Publikasi Ilmiah",
    gender: null
  },
  {
    username: "santri",
    name: "Calon Santri Pendaftar",
    role: "santri",
    roleTitle: "Portal Pendaftaran Santri Baru",
    gender: null
  }
];
