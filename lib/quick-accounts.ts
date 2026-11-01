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
    "category": "Admin",
    "password": "password123"
  },
  {
    "username": "doli",
    "name": "Ust. Doli Irvansyah, Lc.",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "azril",
    "name": "Ust. Azril Al-Haviz Sinambela",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "rizkyfebriadi",
    "name": "Ust. Rizky Febriadi Hasibuan",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "syeikhul",
    "name": "Ust. M. Syaikhul Haq Daulay",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "fatihuddin",
    "name": "Ust. Muhammad Fatihuddin",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "ramadhani",
    "name": "Ust. Rahmadani",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "sindih",
    "name": "Usth. Sindih Wulandari",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "wildatun",
    "name": "Usth. Wildatun Hasanah",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "nursalam",
    "name": "Usth. Nursalam Ramadhani",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "adinda",
    "name": "Usth. Adinda Firyal Afifah",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "kanezya",
    "name": "Usth. Kanezya Azzahra Saifuddin",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "puspita",
    "name": "Usth. Nur Puspita Sari",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "indriawan",
    "name": "H. Indriawan Fahlimi, S.Pd.I, Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "mohammadhafiz",
    "name": "Ust. Mohammad Hafiz, S.Th.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "ahmadjauhari",
    "name": "Ust. Ahmad Jauhari, S.Fil.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "nirwan",
    "name": "Ust. Nirwan Winata Saputra, S.Pd.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "yunishadri",
    "name": "Ust. Yuni Shadri S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "irvan",
    "name": "Ust. Irvan Noordianto, S.Pd.I.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "jepri",
    "name": "Ust. Jepri Arianto, S.Th.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "firdaus",
    "name": "Dr. Firdaus Jeka, S.Pd.I, M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "saifulkhoiri",
    "name": "Ust. Saiful Khoiri, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "agung",
    "name": "Ust. Agung Indra Wirawan, M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "alfiansyah",
    "name": "Ust. Alfiansyah Miftakhul Arif, M.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "satiarambe",
    "name": "Ust. Satia Rambe, M.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "muhammadsaiful",
    "name": "Ust. Muhammad Saiful, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "roky",
    "name": "Ust. Roky Andika, M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "alfareshi",
    "name": "Ust. M. Alfareshi Siregar, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "arisaifudin",
    "name": "Ust. Muhammad Ari Saifuddin, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "bayukurniawan",
    "name": "Ust. Bayu Kurniawan",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "nanda",
    "name": "Ust. Nanda",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "alfinkurniawan",
    "name": "Ust. Alfin Kurniawan",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "willy",
    "name": "Ust. Willy Agustino",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "raihan",
    "name": "Ust. Raihan Ubaidillah",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "habiburrahman",
    "name": "Ust. Habiburrahman",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "ahmadfatih",
    "name": "Ust. Ahmad Fatih Nasution",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "saipulbahri",
    "name": "Ust. Saipul Bahri Sihombing",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "fachri",
    "name": "Ust. Fachri Irfan Nuriyanto",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "alchan",
    "name": "Ust. Alchan Arka Billah",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "ernakhikmawati",
    "name": "Usth. Erna Hikmawati, S.H.I., M.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "sitiumibarokah",
    "name": "Usth. Siti Umi Barokah, S.Pd., Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "dwiwahyuni",
    "name": "Usth. Dwi Wahyuni, S.Pd.I., M.Pd., Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "maflikhatissawama",
    "name": "Usth. Maflikhatissawama, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "annurul",
    "name": "Usth. Annurul Rahmadhani Daulay, S.Pd.I., Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "bintinasrifah",
    "name": "Usth. Binti Nasrifah, S.Hum. Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "tetiherliani",
    "name": "Usth. Teti Herliani, Amd.Keb.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "fahrunnisa",
    "name": "Usth. Fahrun Nisa', S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "yuyunrianti",
    "name": "Usth. Yuyun Rianti, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "fajarmulya",
    "name": "Usth. Fajar Mulya Nisa, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "ayufatina",
    "name": "Usth. Ayu Fatina Nasution, S.E.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nurhikmah",
    "name": "Usth. Nur Hikmah Tanjung, S.Sos., Gr.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "astriaisyah",
    "name": "Usth. Astri Aisyah Rahmi,S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nurhidayati",
    "name": "Usth. Nur Hidayati, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "salmah",
    "name": "Usth. Siti Salmah, S.Pd",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "hotmaidasari",
    "name": "Usth. Hotmaida Sari, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "putriainun",
    "name": "Usth. Putri Ainun Mardyanti, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "sutiaagustin",
    "name": "Usth. Sutia Agustin",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nuriyana",
    "name": "Usth. Nuriyana Azizah",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "ikanovita",
    "name": "Usth. Ika Novita",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "yusriana",
    "name": "Usth. Yusriana",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "yusriani",
    "name": "Usth. Yusriani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "windasari",
    "name": "Usth. Winda Sari",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "febbymaharani",
    "name": "Usth. Febby Maharani Putri",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nurmayani",
    "name": "Usth. Nurmayani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "niaayu",
    "name": "Usth. Nia Ayu Rahmayani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "suciayuprihatin",
    "name": "Usth. Suci Ayu Prihatin",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "maulidiya",
    "name": "Usth. Maulidiya Al-Mutia",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nurlia",
    "name": "Usth. Nurlia",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "wahyuaulia",
    "name": "Usth. Wahyu Aulia Nissa",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "tamarapertiwi",
    "name": "Usth. Tamara Pertiwi",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "gitaliany",
    "name": "Usth. Gita Liany",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "putriamana",
    "name": "Usth. Putri Amanah Sari",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "dinawidya",
    "name": "Usth. Dina Widya Pratiwi",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "arnita",
    "name": "Usth. Arnita Zahrani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "fitriani",
    "name": "Usth. Fitriani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "sriwahyuni",
    "name": "Usth. Sri Wahyuni",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nazwahayati",
    "name": "Usth. Nazwa Hayati Husna Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "wardahnabila",
    "name": "Usth. Wardah Nabila Balqis",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "dianariska",
    "name": "Usth. Diana Riska Br. Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "danisyulya",
    "name": "Usth. Danisy Ulya Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "novitasari",
    "name": "Usth. Novita Sari",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "salwatsurayyah",
    "name": "Usth. Salwa Tsurayyah Siregar",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "revasusanti",
    "name": "Usth. Reva Susanti Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "anyathalia",
    "name": "Usth. Anya Thalia San Marino",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "citramaulidiya",
    "name": "Usth. Citra Maulidiya",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  }
];
