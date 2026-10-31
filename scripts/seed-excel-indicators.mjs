import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const data = [
  {
    catCode: "A",
    catName: "Kedisiplinan",
    unsurs: [
      {
        id: "unsur-a-1",
        name: "Disiplin Waktu Dan Aktivitas",
        indicators: [
          {
            id: "ind-a1-h1",
            text: "Konsisten hadir dimasjid sebelum adzan berkumandang",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-a1-h2",
            text: "Disiplin mengikuti kegiatan ekstrakurikuler/olahraga wajib",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-a1-h3",
            text: "Tepat waktu dalam mengikuti kegiatan",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-a1-s1",
            text: "Terlambat hadir ke masjid atau kegiatan pondok",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-a1-s2",
            text: "Tidak mengikuti ekstrakurikuler/olahraga wajib tanpa uzur syar'i",
            type: "SAYYIAH",
            score: -0.100,
            tingkat: "Sedang"
          },
          {
            id: "ind-a1-s3",
            text: "Terlambat kembali ke asrama setelah kegiatan selesai",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-a-2",
        name: "Disiplin Perizinan",
        indicators: [
          {
            id: "ind-a2-h1",
            text: "Tertib prosedur perizinan keluar/masuk pondok (tidak melanggar batas waktu)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-a2-h2",
            text: "Mematuhi aturan perizinan kepulangan (kembali tepat waktu)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-a2-h3",
            text: "Tidak pernah mencatat melakukan pelanggaran kabur",
            type: "HASANAH",
            score: 0.100,
            tingkat: "Tinggi"
          },
          {
            id: "ind-a2-s1",
            text: "Terlambat kembali ke pondok melebihi batas waktu surat izin",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-a2-s2",
            text: "Keluar pondok tanpa surat izin resmi dari bagian pengasuhan",
            type: "SAYYIAH",
            score: -0.150,
            tingkat: "Sedang"
          },
          {
            id: "ind-a2-s3",
            text: "Melanggar batas izin kepulangan tanpa konfirmasi orang tua/wali",
            type: "SAYYIAH",
            score: -0.100,
            tingkat: "Sedang"
          }
        ]
      },
      {
        id: "unsur-a-3",
        name: "Disiplin Atribut Dan Kerapian Fisik",
        indicators: [
          {
            id: "ind-a3-h1",
            text: "Memakai pakaian sesuai jadwal/kegiatan dan rapi",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-a3-h2",
            text: "Menjaga hijab sesuai standar pondok",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-a3-h3",
            text: "Konsisten memakai kelengkapan atribut (papan nama & pin)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-a3-s1",
            text: "Tidak mengenakan atribut resmi (papan nama/pin) saat kegiatan",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-a3-s2",
            text: "Berpakaian tidak sesuai jadwal atau melanggar kesopanan busana pondok",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-a3-s3",
            text: "Model pakaian atau potongan rambut tidak sesuai ketentuan pondok",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-a-4",
        name: "Disiplin Larangan Dan Penggunaan Fasilitas",
        indicators: [
          {
            id: "ind-a4-h1",
            text: "Steril dari kepemilikan barang terlarang (barang elektronik)",
            type: "HASANAH",
            score: 0.100,
            tingkat: "Tinggi"
          },
          {
            id: "ind-a4-h2",
            text: "Disiplin menggunakan fasilitas air, listrik, dan gedung pondok",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-a4-h3",
            text: "Mematuhi batas jam istirahat malam dan jam belajar malam",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-a4-s1",
            text: "Membawa atau menyimpan perangkat elektronik tanpa izin pengasuhan",
            type: "SAYYIAH",
            score: -0.200,
            tingkat: "Berat"
          },
          {
            id: "ind-a4-s2",
            text: "Memboroskan atau merusak fasilitas air, listrik, dan inventaris gedung",
            type: "SAYYIAH",
            score: -0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-a4-s3",
            text: "Begadang atau beraktivitas di luar kamar melewati batas jam malam",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-a-5",
        name: "Responsibilitas Atas Pelanggaran",
        indicators: [
          {
            id: "ind-a5-h1",
            text: "Suka rela mengonfirmasi/mengakui kesalahan jika melanggar",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-a5-h2",
            text: "Menjalankan konsekuensi/takzir dari pengurus dengan ikhlas",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-a5-s1",
            text: "Menghindar atau menolak menjalankan takzir disiplin dari pengurus",
            type: "SAYYIAH",
            score: -0.150,
            tingkat: "Sedang"
          },
          {
            id: "ind-a5-s2",
            text: "Membantah atau tidak kooperatif saat dikonfirmasi pelanggaran disiplin",
            type: "SAYYIAH",
            score: -0.100,
            tingkat: "Sedang"
          }
        ]
      }
    ]
  },
  {
    catCode: "B",
    catName: "Adab/Ta'zim",
    unsurs: [
      {
        id: "unsur-b-1",
        name: "Ta'zim kepada masyayikh dan asatidzah",
        indicators: [
          {
            id: "ind-b1-h1",
            text: "Menerapkan adab berpapasan (membungkuk, mengucapkan salam, menyalami/mencium tangan sesuai syari'at)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b1-h2",
            text: "Menjaga khidmat, ketenangan, dan fokus penuh saat guru memberikan taujihat/pengarahan",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b1-h3",
            text: "Menjauhi perilaku su'ul adab (memotong pembicaraan, membelakangi, atau meninggikan suara didepan guru)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b1-h4",
            text: "Cepat merespon dan melaksanakan instruksi mendadak dari pengasuh",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b1-s1",
            text: "Memotong pembicaraan, meninggikan suara, atau membelakangi guru",
            type: "SAYYIAH",
            score: -0.100,
            tingkat: "Sedang"
          },
          {
            id: "ind-b1-s2",
            text: "Tidak memperhatikan atau bersikap acuh saat guru memberikan pengarahan",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-b1-s3",
            text: "Lambat atau mengabaikan instruksi pengasuh/asatidzah",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-b-2",
        name: "Adab Terhadap Ilmu Dan Kitab/Mushaf",
        indicators: [
          {
            id: "ind-b2-h1",
            text: "Membawa, membuka, dan meletakkan kitab suci dengan penuh rasa hormat (tidak ditaruh dilantai)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b2-h2",
            text: "Mengutamakan menjaga wudhu saat beribadah & hendak tidur",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b2-h3",
            text: "Datang lebih awal dimajlis dan menjaga kerapian catatan",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b2-s1",
            text: "Meletakkan mushaf Al-Qur'an atau kitab syar'i di lantai sembarangan",
            type: "SAYYIAH",
            score: -0.100,
            tingkat: "Sedang"
          },
          {
            id: "ind-b2-s2",
            text: "Mencoret-coret atau memperlakukan kitab suci tanpa penghormatan",
            type: "SAYYIAH",
            score: -0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-b2-s3",
            text: "Terlambat hadir di majelis taklim atau tidak membawa catatan ilmu",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-b-3",
        name: "Adab Keseharian Dimajlis & Masjid",
        indicators: [
          {
            id: "ind-b3-h1",
            text: "Menjaga ketertiban & tidak bergurau/berbincang didalam masjid/majlis",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b3-h2",
            text: "Memperhatikan adab makan, minum, dan tidur sesuai tuntunan sunnah dilingkungan asrama",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b3-s1",
            text: "Bergurau, membuat gaduh, atau berlari-lari di dalam masjid/majlis",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-b3-s2",
            text: "Makan atau minum sambil berdiri/berjalan melanggar adab sunnah",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-b-4",
        name: "Adab Sesama Santri (Ukhuwah)",
        indicators: [
          {
            id: "ind-b4-h1",
            text: "Menghormati santri senior/pengurus dan manyayangi santri junior (tidak melakukan intimidasi/bullying)",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-b4-h2",
            text: "Menjaga lisan dari mencela, memanggil dengan julukan buruk, ghibah, maupun namimah",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b4-h3",
            text: "Saling tolong-menolong dalam kebaikan dan menjaga hak milik orang lain (steril ghosob)",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-b4-s1",
            text: "Melakukan intimidasi fisik, verbal, atau perundungan (bullying) antarsantri",
            type: "SAYYIAH",
            score: -0.250,
            tingkat: "Berat"
          },
          {
            id: "ind-b4-s2",
            text: "Memakai atau meminjam barang santri lain tanpa izin (ghosob)",
            type: "SAYYIAH",
            score: -0.100,
            tingkat: "Sedang"
          },
          {
            id: "ind-b4-s3",
            text: "Mencela, mengumpat, atau memanggil teman dengan julukan buruk",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-b-5",
        name: "Adab Terhadap Lingkungan Pondok",
        indicators: [
          {
            id: "ind-b5-h1",
            text: "Menjaga kebersihan dan kesucian fasilitas ibadah, asrama, serta area bersama sebagai bentuk syukur",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b5-h2",
            text: "Menghormati hak tetangga pondok dan masyarakat sekitar dengan tidak membuat kegaduhan",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-b5-s1",
            text: "Mengotori area ibadah atau mencemari lingkungan fasilitas bersama",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-b5-s2",
            text: "Membuat kegaduhan yang mengganggu ketenangan warga sekitar pondok",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      }
    ]
  },
  {
    catCode: "C",
    catName: "Kemandirian & Kebersihan",
    unsurs: [
      {
        id: "unsur-c-1",
        name: "Kemandirian Hidup Diasrama",
        indicators: [
          {
            id: "ind-c1-h1",
            text: "Mampu mengelola kebutuhan pribadi secara mandiri (mencuci pakaian, dan menata logistik pribadi)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-c1-h2",
            text: "Disiplin mengelola saku bulanan",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-c1-h3",
            text: "Mandiri dalam bangun tidur dan mempersiapkan diri sebelum jadwal shubuh tanpa perlu dibangunkan paksa",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-c1-s1",
            text: "Susah dibangunkan untuk shalat subuh atau harus dipaksa berulang kali",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-c1-s2",
            text: "Menelantarkan pakaian kotor atau bergantung berlebihan pada santri lain",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-c-2",
        name: "Kebersihan Kamar Dan Fasilitas Pribadi",
        indicators: [
          {
            id: "ind-c2-h1",
            text: "Menjaga kerapian kasur, bantal, dan lemari pakaian secara konsisten",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-c2-h2",
            text: "Mengatur pembuangan sampah kamar pada tempatnya dan tidak menumpuk baju kotor",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-c2-h3",
            text: "Menjaga kebersihan pakaian dari najis dan bau",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-c2-s1",
            text: "Lemari berantakan atau kasur tidak dirapikan saat inspeksi asrama",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-c2-s2",
            text: "Menumpuk pakaian kotor berbau atau membuang sampah sembarangan di kamar",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-c-3",
        name: "Tanggung Jawab Area Publik",
        indicators: [
          {
            id: "ind-c3-h1",
            text: "Aktif dan bersemangat dalam kegiatan tandzif mingguan pondok",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-c3-h2",
            text: "Menjalankan piket asrama (menyapu, mengepel, membersihkan kamar mandi, masjid) dengan amanah",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-c3-s1",
            text: "Mangkir atau melarikan diri dari jadwal piket kebersihan asrama/kamar mandi",
            type: "SAYYIAH",
            score: -0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-c3-s2",
            text: "Tidak berpartisipasi dalam agenda ro'an/tandzif am kebersihan pondok",
            type: "SAYYIAH",
            score: -0.075,
            tingkat: "Sedang"
          }
        ]
      },
      {
        id: "unsur-c-4",
        name: "Penerapan Thaharah Dan Kesehatan Keseharian",
        indicators: [
          {
            id: "ind-c4-h1",
            text: "Memahami dan mempraktikkan fiqih thaharah (bersuci) dengan benar dikamar mandi/tempat wudhu",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-c4-h2",
            text: "Menjaga kebersihan diri (memotong kuku, manjaga kesehatan gigi, dan rambut rapi)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-c4-h3",
            text: "Peduli terhadap kelestarian lingkungan pondok (tidak membuang sampah sembarangan, menghemat air/listrik)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-c4-s1",
            text: "Kuku panjang kotor atau mengabaikan higienitas diri dasar",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-c4-s2",
            text: "Membiarkan kran air menyala atau memboroskan fasilitas sanitasi pondok",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      }
    ]
  },
  {
    catCode: "D",
    catName: "Ubudiyah/Ibadah",
    unsurs: [
      {
        id: "unsur-d-1",
        name: "Istiqamah Shalat Wajib Berjama'ah",
        indicators: [
          {
            id: "ind-d1-h1",
            text: "Konsisten hadir dimasjid sebelum adzan berkumandang",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-d1-h2",
            text: "Tidak masbuk/ tertinggal takbiratul ihram pertama imam",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-d1-h3",
            text: "Menjaga kekhusyukan dan tidak bergurai dalam barisan shalat",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-d1-s1",
            text: "Terlambat atau masbuk dalam shalat wajib berjama'ah di masjid",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-d1-s2",
            text: "Bergurau atau mengobrol dalam shaf shalat saat ibadah berlangsung",
            type: "SAYYIAH",
            score: -0.100,
            tingkat: "Sedang"
          },
          {
            id: "ind-d1-s3",
            text: "Tidak hadir shalat berjama'ah tanpa surat izin sakit dari tim medis",
            type: "SAYYIAH",
            score: -0.150,
            tingkat: "Sedang"
          }
        ]
      },
      {
        id: "unsur-d-2",
        name: "Menhidupkan Sunnah Yaumiyah",
        indicators: [
          {
            id: "ind-d2-h1",
            text: "Rutin melaksanakan shalar rawatib (qobliyah dan ba'diyah)",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-d2-h2",
            text: "Istiqamah mendirikan shalat malam (hajat, tahajjud) dan shalat dhuha",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Tinggi"
          },
          {
            id: "ind-d2-h3",
            text: "Konsisten mengamalkan puasa sunnah (senin-kamis, ayyamul bidh atau daud)",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Tinggi"
          },
          {
            id: "ind-d2-s1",
            text: "Menghindari atau bermalas-malasan saat seruan shalat malam/tahajjud",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-d2-s2",
            text: "Mengabaikan adab ibadah sunnah yang sedang diprogramkan pondok",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-d-3",
        name: "Dzikir, Wirid, Dan Do'a",
        indicators: [
          {
            id: "ind-d3-h1",
            text: "Tertib mengikuti pembacaan wirid dan dzikir setelah shalat",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-d3-h2",
            text: "Menghafal dan mengamalkan do'a-do'a harian sesuai tuntunan pondok",
            type: "HASANAH",
            score: 0.050,
            tingkat: "Sedang"
          },
          {
            id: "ind-d3-s1",
            text: "Langsung berdiri atau keluar dari masjid tanpa mengikuti wirid ba'da shalat",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          },
          {
            id: "ind-d3-s2",
            text: "Bermain-main atau tidak khusyuk saat doa bersama dipimpin imam",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-d-4",
        name: "Interaksi Khidmat Al-Qur'an",
        indicators: [
          {
            id: "ind-d4-h1",
            text: "Disiplin mengikuti tadarrus pagi/magrib tanpa absen",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-d4-h2",
            text: "Memenuhi/ melebihi target minimal membaca Al-Qur'an harian (one day one juz)",
            type: "HASANAH",
            score: 0.075,
            tingkat: "Tinggi"
          },
          {
            id: "ind-d4-s1",
            text: "Mangkir dari halaqah tadarrus Al-Qur'an pagi/maghrib",
            type: "SAYYIAH",
            score: -0.075,
            tingkat: "Sedang"
          },
          {
            id: "ind-d4-s2",
            text: "Tidak membawa mushaf atau tidak mencapai target tilawah tanpa uzur",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      },
      {
        id: "unsur-d-5",
        name: "Khidmat Ubudiyah (Petugas Ibadah)",
        indicators: [
          {
            id: "ind-d5-h1",
            text: "Mampu dan siap menjadi imam shalat dan memimpin wirid dilingkungan kamar/asrama",
            type: "HASANAH",
            score: 0.100,
            tingkat: "Tinggi"
          },
          {
            id: "ind-d5-s1",
            text: "Menolak tugas piket adzan/muadzin atau memimpin doa kamar yang ditugaskan",
            type: "SAYYIAH",
            score: -0.050,
            tingkat: "Ringan"
          }
        ]
      }
    ]
  }
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Beginning transaction...");
    await client.query("BEGIN");

    for (const cat of data) {
      await client.query(
        `INSERT INTO categories (id, code, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, name = EXCLUDED.name`,
        [`cat-${cat.catCode.toLowerCase()}`, cat.catCode, cat.catName]
      );

      for (const unsur of cat.unsurs) {
        await client.query(
          `INSERT INTO unsurs (id, category_name, name)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name, name = EXCLUDED.name`,
          [unsur.id, cat.catName, unsur.name]
        );

        await client.query(`DELETE FROM indicators WHERE unsur_id = $1`, [unsur.id]);

        for (const ind of unsur.indicators) {
          await client.query(
            `INSERT INTO indicators (id, unsur_id, text, type, default_score, tingkat)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [ind.id, unsur.id, ind.text, ind.type, ind.score, ind.tingkat]
          );
        }
      }
    }

    await client.query("COMMIT");
    console.log("Successfully seeded all categories, unsurs, and indicators from table!");

    const countRes = await client.query("SELECT COUNT(*) as c FROM indicators");
    console.log("Total indicators in database now:", countRes.rows[0].c);

    const unsursRes = await client.query("SELECT COUNT(*) as c FROM unsurs");
    console.log("Total unsurs in database now:", unsursRes.rows[0].c);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
