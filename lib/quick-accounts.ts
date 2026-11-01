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
    "name": "Doli Irvansyah, Lc",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "fatihuddin",
    "name": "Muhammad Fatihuddin",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "syeikhul",
    "name": "Muhammad Syeikhul Haq Daulay",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "ramadhani",
    "name": "Ramadhani",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "msofian",
    "name": "Ust. Muhammad Sofian",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "naufal",
    "name": "Ust. Naufal",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "pengasuhan",
    "name": "Ust. Rahmat Hidayat",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "password123"
  },
  {
    "username": "rezamulana",
    "name": "Ust. Reza Mulana",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "willy",
    "name": "Willy Agustino",
    "role": "PENGASUHAN",
    "gender": "Putra",
    "category": "BK Putra",
    "password": "RDS123"
  },
  {
    "username": "puspita",
    "name": "Nur Puspita Sari",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "nuriyana",
    "name": "Nuriyana Azizah",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "salwa",
    "name": "Salwa Tsurrayyah",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "sindih",
    "name": "Sindih Wulandari",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "salmah",
    "name": "Siti Salmah, S.Pd",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "suci",
    "name": "Suci Ayu Prihatin",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "ernakhikmawati",
    "name": "Ustadzah Erna Khikmawati, S.H.I, M.Pd.",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "RDS123"
  },
  {
    "username": "pengasuhan_putri",
    "name": "Ustadzah Halimah, S.Pd.I",
    "role": "PENGASUHAN",
    "gender": "Putri",
    "category": "BK Putri",
    "password": "password123"
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
    "username": "alwimaruf",
    "name": "Ust. Alwi Ma'ruf",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "ariel",
    "name": "Ust. Ariel Kahhari",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "asharimuslim",
    "name": "Ust. Ashari Muslim, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "auliarahmat",
    "name": "Ust. Aulia Rahmat",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "azril",
    "name": "Ust. Azril Alhafiz Sinambela",
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
    "username": "dimas",
    "name": "Ust. Dimas Agus Wandi",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "faqihan",
    "name": "Ust. Faqihan Nugroho",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "imamgusnadi",
    "name": "Ust. Imam Ahmad Gusnadi",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "indra",
    "name": "Ust. Indra Irawan",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "johan",
    "name": "Ust. Johan Almunawwar",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "alfareshi",
    "name": "Ust. Muhammad Alfareshi Siregar, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "arisaifudin",
    "name": "Ust. Muhammad Ari Saifudin, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "msaiful",
    "name": "Ust. Muhammad Saiful, S.Pd.",
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
    "username": "rahmat_azzam",
    "name": "Ust. Rahmat Azzam",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "raihan",
    "name": "Ust. Raihan Ubaidilah",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "rizkyfebriadi",
    "name": "Ust. Rizky Febriadi",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "rizkyharun",
    "name": "Ust. Rizky Harun",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "rokiandika",
    "name": "Ust. Roki Andika, M.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "sunari",
    "name": "Ust. Sunari Andre",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "yogaprasetya",
    "name": "Ust. Yoga Prasetya",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "RDS123"
  },
  {
    "username": "ustadz",
    "name": "Ustadz Fauzan Al-Banjari",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "password123"
  },
  {
    "username": "ustadz_ilham",
    "name": "Ustadz Ilham Wahyudi, S.Pd.",
    "role": "GURU",
    "gender": "Putra",
    "category": "Guru Putra",
    "password": "password123"
  },
  {
    "username": "annurul",
    "name": "Ustadzah Annurul Rahmadhani Daulay, S.Pd.I.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "astriaisyah",
    "name": "Ustadzah Astri Aisyah Rahmi, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "ayufatina",
    "name": "Ustadzah Ayu Fatina Nasution, S.E.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "bintinasrifah",
    "name": "Ustadzah Binti Nasrifah, S.Hum.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "dwiwahyuni",
    "name": "Ustadzah Dwi Wahyuni, M.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "fahrunnisa",
    "name": "Ustadzah Fahrun Nisa, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "fajarmulya",
    "name": "Ustadzah Fajar Mulya Nisa Agustina, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "irmaarya",
    "name": "Ustadzah Irma Arya Ningsih, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "maflihatis",
    "name": "Ustadzah Maflihatissawamah, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "ustadzah",
    "name": "Ustadzah Maryam, S.Pd.I",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "password123"
  },
  {
    "username": "nirmalasari",
    "name": "Ustadzah Nirmala Sari, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nurhidayati",
    "name": "Ustadzah Nur Hidayati, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nurhikmah",
    "name": "Ustadzah Nur Hikmah Tanjung, S.Sos.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "ustadzah_nurul",
    "name": "Ustadzah Nurul Hidayah",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "password123"
  },
  {
    "username": "tetiherliani",
    "name": "Ustadzah Teti Herliani, S.Keb.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "yuyunrianti",
    "name": "Ustadzah Yuyun Rianti, S.Pd.I.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "adinda",
    "name": "Usth. Adinda Firyal Afifah",
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
    "username": "arnita",
    "name": "Usth. Arnita Zahrani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "citramaulidya",
    "name": "Usth. Citra Maulidya",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "danisy",
    "name": "Usth. Danisy Ulya Nasution",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "dianarizka",
    "name": "Usth. Diana Rizka Br Nasution",
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
    "username": "febymaharani",
    "name": "Usth. Feby Maharani Putri",
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
    "username": "gitaliany",
    "name": "Usth. Gita Liany",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "hotmaida",
    "name": "Usth. Hotmaida Sari",
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
    "username": "kenezya",
    "name": "Usth. Kenezya Azzahra Saifuddin",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "maulidya",
    "name": "Usth. Maulidya Almuthia",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nabilaghiza",
    "name": "Usth. Nabila Ghiza Al-Qumairah",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nazwahayati",
    "name": "Usth. Nazwa Hayati Husna",
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
    "username": "novitasari",
    "name": "Usth. Novita Sari",
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
    "username": "nurmayani",
    "name": "Usth. Nurmayani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "nursalam",
    "name": "Usth. Nursalam Ramadhani",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "putriainun",
    "name": "Usth. Putri Ainun Mardianti, S.Pd.",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "putriamanah",
    "name": "Usth. Putri Amanah Sari",
    "role": "GURU",
    "gender": "Putri",
    "category": "Guru Putri",
    "password": "RDS123"
  },
  {
    "username": "revasusanti",
    "name": "Usth. Reva Susanti",
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
    "username": "sutia",
    "name": "Usth. Sutia Agustin",
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
    "username": "wahyuaulia",
    "name": "Usth. Wahyu Aulia Nisa",
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
    "username": "wildatun",
    "name": "Usth. Wildatun Hasanah",
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
  }
];
