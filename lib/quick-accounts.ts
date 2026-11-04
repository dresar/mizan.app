export interface QuickAccount {
  username: string;
  name: string;
  role: "SUPER_ADMIN" | "PENGASUHAN" | "GURU";
  gender: "Putra" | "Putri";
  category: "Admin" | "BK Putra" | "BK Putri" | "Guru Putra" | "Guru Putri";
  password?: string;
}

export const QUICK_ACCOUNTS: QuickAccount[] = [
  {
    "username": "admin",
    "name": "Ust. H. Ahmad Syukri, Lc.",
    "role": "SUPER_ADMIN",
    "gender": "Putra",
    "category": "Admin"
  },
  {
    "username": "doli",
    "name": "Ust. Doli Irvansyah, Lc.",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra"
  },
  {
    "username": "azril",
    "name": "Ust. Azril Al-Haviz Sinambela",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra"
  },
  {
    "username": "rizkyfebriadi",
    "name": "Ust. Rizky Febriadi Hasibuan",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra"
  },
  {
    "username": "syeikhul",
    "name": "Ust. M. Syaikhul Haq Daulay",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra"
  },
  {
    "username": "fatihuddin",
    "name": "Ust. Muhammad Fatihuddin",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra"
  },
  {
    "username": "ramadhani",
    "name": "Ust. Rahmadani",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra"
  },
  {
    "username": "sindih",
    "name": "Usth. Sindih Wulandari",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri"
  },
  {
    "username": "wildatun",
    "name": "Usth. Wildatun Hasanah",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri"
  },
  {
    "username": "nursalam",
    "name": "Usth. Nursalam Ramadhani",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri"
  },
  {
    "username": "adinda",
    "name": "Usth. Adinda Firyal Afifah",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri"
  },
  {
    "username": "kanezya",
    "name": "Usth. Kanezya Azzahra Saifuddin",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri"
  },
  {
    "username": "puspita",
    "name": "Usth. Nur Puspita Sari",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri"
  },
  {
    "username": "indriawan",
    "name": "H. Indriawan Fahlimi, S.Pd.I, Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "mohammadhafiz",
    "name": "Ust. Mohammad Hafiz, S.Th.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "ahmadjauhari",
    "name": "Ust. Ahmad Jauhari, S.Fil.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "nirwan",
    "name": "Ust. Nirwan Winata Saputra, S.Pd.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "yunishadri",
    "name": "Ust. Yuni Shadri S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "irvan",
    "name": "Ust. Irvan Noordianto, S.Pd.I.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "jepri",
    "name": "Ust. Jepri Arianto, S.Th.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "firdaus",
    "name": "Dr. Firdaus Jeka, S.Pd.I, M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "saifulkhoiri",
    "name": "Ust. Saiful Khoiri, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "agung",
    "name": "Ust. Agung Indra Wirawan, M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "alfiansyah",
    "name": "Ust. Alfiansyah Miftakhul Arif, M.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "satiarambe",
    "name": "Ust. Satia Rambe, M.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "muhammadsaiful",
    "name": "Ust. Muhammad Saiful, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "roky",
    "name": "Ust. Roky Andika, M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "alfareshi",
    "name": "Ust. M. Alfareshi Siregar, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "arisaifudin",
    "name": "Ust. Muhammad Ari Saifuddin, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "bayukurniawan",
    "name": "Ust. Bayu Kurniawan",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "nanda",
    "name": "Ust. Nanda",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "alfinkurniawan",
    "name": "Ust. Alfin Kurniawan",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "willy",
    "name": "Ust. Willy Agustino",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "raihan",
    "name": "Ust. Raihan Ubaidillah",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "habiburrahman",
    "name": "Ust. Habiburrahman",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "ahmadfatih",
    "name": "Ust. Ahmad Fatih Nasution",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "saipulbahri",
    "name": "Ust. Saipul Bahri Sihombing",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "fachri",
    "name": "Ust. Fachri Irfan Nuriyanto",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "alchan",
    "name": "Ust. Alchan Arka Billah",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra"
  },
  {
    "username": "ernakhikmawati",
    "name": "Usth. Erna Hikmawati, S.H.I., M.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "sitiumibarokah",
    "name": "Usth. Siti Umi Barokah, S.Pd., Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "dwiwahyuni",
    "name": "Usth. Dwi Wahyuni, S.Pd.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "maflikhatissawama",
    "name": "Usth. Maflikhatissawama, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "annurul",
    "name": "Usth. Annurul Rahmadhani Daulay, S.Pd.I., Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "bintinasrifah",
    "name": "Usth. Binti Nasrifah, S.Hum. Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "tetiherliani",
    "name": "Usth. Teti Herliani, Amd.Keb.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "fahrunnisa",
    "name": "Usth. Fahrun Nisa', S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "yuyunrianti",
    "name": "Usth. Yuyun Rianti, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "fajarmulya",
    "name": "Usth. Fajar Mulya Nisa, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "ayufatina",
    "name": "Usth. Ayu Fatina Nasution, S.E.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "nurhikmah",
    "name": "Usth. Nur Hikmah Tanjung, S.Sos., Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "astriaisyah",
    "name": "Usth. Astri Aisyah Rahmi,S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "nurhidayati",
    "name": "Usth. Nur Hidayati, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "salmah",
    "name": "Usth. Siti Salmah, S.Pd",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "hotmaidasari",
    "name": "Usth. Hotmaida Sari, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "putriainun",
    "name": "Usth. Putri Ainun Mardyanti, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "sutiaagustin",
    "name": "Usth. Sutia Agustin",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "nuriyana",
    "name": "Usth. Nuriyana Azizah",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "ikanovita",
    "name": "Usth. Ika Novita",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "yusriana",
    "name": "Usth. Yusriana",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "yusriani",
    "name": "Usth. Yusriani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "windasari",
    "name": "Usth. Winda Sari",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "febbymaharani",
    "name": "Usth. Febby Maharani Putri",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "nurmayani",
    "name": "Usth. Nurmayani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "niaayu",
    "name": "Usth. Nia Ayu Rahmayani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "suciayuprihatin",
    "name": "Usth. Suci Ayu Prihatin",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "maulidiya",
    "name": "Usth. Maulidiya Al-Mutia",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "nurlia",
    "name": "Usth. Nurlia",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "wahyuaulia",
    "name": "Usth. Wahyu Aulia Nissa",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "tamarapertiwi",
    "name": "Usth. Tamara Pertiwi",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "gitaliany",
    "name": "Usth. Gita Liany",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "putriamana",
    "name": "Usth. Putri Amanah Sari",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "dinawidya",
    "name": "Usth. Dina Widya Pratiwi",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "arnita",
    "name": "Usth. Arnita Zahrani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "fitriani",
    "name": "Usth. Fitriani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "sriwahyuni",
    "name": "Usth. Sri Wahyuni",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "nazwahayati",
    "name": "Usth. Nazwa Hayati Husna Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "wardahnabila",
    "name": "Usth. Wardah Nabila Balqis",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "dianariska",
    "name": "Usth. Diana Riska Br. Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "danisyulya",
    "name": "Usth. Danisy Ulya Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "novitasari",
    "name": "Usth. Novita Sari",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "salwatsurayyah",
    "name": "Usth. Salwa Tsurayyah Siregar",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "revasusanti",
    "name": "Usth. Reva Susanti Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "anyathalia",
    "name": "Usth. Anya Thalia San Marino",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  },
  {
    "username": "citramaulidiya",
    "name": "Usth. Citra Maulidiya",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri"
  }
];
