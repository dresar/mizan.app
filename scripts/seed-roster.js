const fs = require('fs');
const { Pool } = require('pg');

let env = '';
if (fs.existsSync('.env.local')) env = fs.readFileSync('.env.local', 'utf8');
else if (fs.existsSync('.env')) env = fs.readFileSync('.env', 'utf8');
const m = env.match(/DATABASE_URL=([^\r\n]+)/);
const dbUrl = m ? m[1].replace(/['\"]/g, '') : process.env.DATABASE_URL;

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

const data = [
  
  { class: '6A', no: 1, stbk: '211293', name: 'Muhammad Ridho Rifai' },
  { class: '6A', no: 2, stbk: '211365', name: 'Reno Irawan' },
  { class: '6A', no: 3, stbk: '211327', name: 'Muhammad Rifai' },
  { class: '6A', no: 4, stbk: '211268', name: 'Ridho Alfareen' },
  { class: '6A', no: 5, stbk: '211355', name: 'Rido Syahputra' },
  { class: '6A', no: 6, stbk: '211350', name: 'Aditiya Imam Sabri' },
  { class: '6A', no: 7, stbk: '211295', name: 'Muhammad Rizky As Siddiq' },
  { class: '6A', no: 8, stbk: '211394', name: 'Muhammad rizqy Zalvi' },
  { class: '6A', no: 9, stbk: '211425', name: 'Rizki Febrian HRP' },
  { class: '6A', no: 10, stbk: '211300', name: 'Fahri Rahmadani' },
  { class: '6A', no: 11, stbk: '211321', name: 'Hardiansyah' },
  { class: '6A', no: 12, stbk: '211396', name: 'Dika Ramadhani' },
  { class: '6A', no: 13, stbk: '211331', name: 'Yuda Ardiansyah' },
  { class: '6A', no: 14, stbk: '211269', name: 'Fauzan Azri Hadi' },
  { class: '6A', no: 15, stbk: '211371', name: 'Zidan Rahman Purba' },
  { class: '6A', no: 16, stbk: '211354', name: 'Naufal Fazly Rashya' },
  { class: '6A', no: 17, stbk: '211261', name: 'Mecky Alfrenando' },
  { class: '6A', no: 18, stbk: '211332', name: 'Chairil Anggara' },
  { class: '6A', no: 19, stbk: '211311', name: 'Muhammad Fadel' },
  { class: '6A', no: 20, stbk: '211283', name: 'Aji Ifansah' },
  { class: '6A', no: 21, stbk: '211320', name: 'Khadirun Akbar' },
  { class: '6A', no: 22, stbk: '211315', name: 'Rangga Putra Ramadhan' },
  { class: '6A', no: 23, stbk: '211310', name: 'Rafiq Maulavarid' },
  { class: '6A', no: 24, stbk: '241678', name: 'Sandi Triadi' },
  { class: '6A', no: 25, stbk: '211335', name: 'Adi putra' },
  { class: '6A', no: 26, stbk: '211351', name: 'Alfi Siregar' },
  { class: '6A', no: 27, stbk: '261792', name: 'Rizky Aldiano' },

  
  { class: '6B', no: 1, stbk: '211277', name: 'Aulia Rahmah Habibi' },
  { class: '6B', no: 2, stbk: '211130', name: 'Nadin Aulia Putri' },
  { class: '6B', no: 3, stbk: '211323', name: 'Umi Ramadina' },
  { class: '6B', no: 4, stbk: '211414', name: 'Keyla Suci Ramadhani' },
  { class: '6B', no: 5, stbk: '241710', name: 'Naisha Putri' },
  { class: '6B', no: 6, stbk: '211291', name: 'Laura Dara Junita' },
  { class: '6B', no: 7, stbk: '211289', name: 'Linda Syahfitri' },
  { class: '6B', no: 8, stbk: '211409', name: 'Talitha Salsabila Siregar' },
  { class: '6B', no: 9, stbk: '211294', name: 'Zira Zafirah' },
  { class: '6B', no: 10, stbk: '211370', name: 'Metha Triyanti' },
  { class: '6B', no: 11, stbk: '211356', name: 'Michelia Alkhamisa' },
  { class: '6B', no: 12, stbk: '211272', name: 'Yulia Ika Sari' },
  { class: '6B', no: 13, stbk: '211345', name: 'Rahmah Nurhidayati' },
  { class: '6B', no: 14, stbk: '211384', name: 'Puji Handayani' },
  { class: '6B', no: 15, stbk: '211368', name: 'Khairum Alfisah' },
  { class: '6B', no: 16, stbk: '211372', name: 'Sulis Tyan Diny' },
  { class: '6B', no: 17, stbk: '211339', name: 'Adinda Desta Nur Fadilla' },
  { class: '6B', no: 18, stbk: '211312', name: 'Umayroh Amini' },
  { class: '6B', no: 19, stbk: '211303', name: 'Triyani' },
  { class: '6B', no: 20, stbk: '211275', name: 'Dwi Syafira Khanza' },
  { class: '6B', no: 21, stbk: '241716', name: 'Hiqly Suhiya Br. Sianipar' },
  { class: '6B', no: 22, stbk: '241688', name: 'Widianti Rizkia' },
  { class: '6B', no: 23, stbk: '211358', name: 'Nilam Nur Aisyah' },
  { class: '6B', no: 24, stbk: '211288', name: 'Aira Seftiani Ramadan' },
  { class: '6B', no: 25, stbk: '211346', name: 'Siska Tria Ningsih' },
  { class: '6B', no: 26, stbk: '211313', name: 'Laudia Kurniati' },
  { class: '6B', no: 27, stbk: '211297', name: 'Luvi Damayanti' },
  { class: '6B', no: 28, stbk: '241712', name: 'Adinda Nur Fika Cindi' },
  { class: '6B', no: 29, stbk: '211416', name: 'Janur Almunawwaroh Damanik' },

  
  { class: '5B', no: 1, stbk: '221503', name: 'Nuraisa Putri' },
  { class: '5B', no: 2, stbk: '221493', name: 'Astri Claudia Putri' },
  { class: '5B', no: 3, stbk: '221501', name: 'Tri Novita Pratiwi' },
  { class: '5B', no: 4, stbk: '221510', name: 'Nur Salwa Mawaddah' },
  { class: '5B', no: 5, stbk: '221526', name: 'Julia Safitri' },
  { class: '5B', no: 6, stbk: '221004', name: 'Alwasliyah' },
  { class: '5B', no: 7, stbk: '221499', name: 'Zeelva Hidayafi Putri' },
  { class: '5B', no: 8, stbk: '221521', name: 'Ainiya Faida Azmi' },
  { class: '5B', no: 9, stbk: '221511', name: 'Salwa Nabila' },
  { class: '5B', no: 10, stbk: '221546', name: 'Wintan Fazira' },
  { class: '5B', no: 11, stbk: '221540', name: 'Dewi Puspita' },
  { class: '5B', no: 12, stbk: '221514', name: 'Widiya Fazuwa' },
  { class: '5B', no: 13, stbk: '221535', name: 'Putri' },
  { class: '5B', no: 14, stbk: '221534', name: 'Najwa Hafizah' },
  { class: '5B', no: 15, stbk: '221504', name: 'Aulia Rahcmi' },
  { class: '5B', no: 16, stbk: '221505', name: 'Ayuna Meiroza Pangesti' },
  { class: '5B', no: 17, stbk: '221530', name: 'Ainun Nafizah' },
  { class: '5B', no: 18, stbk: '221537', name: 'Sindy Wardatul Jannah' },
  { class: '5B', no: 19, stbk: '221494', name: 'Luna Satifa' },
  { class: '5B', no: 20, stbk: '221515', name: 'Hanifah Thohiroh' },

  
  { class: '5A', no: 1, stbk: '221430', name: 'Indra Gusti Ramadhan' },
  { class: '5A', no: 2, stbk: '221488', name: 'Achmad Muzaqi' },
  { class: '5A', no: 3, stbk: '221445', name: 'Muhammad Fahri Ramadani' },
  { class: '5A', no: 4, stbk: '221475', name: 'Muhammad Nur Fadli' },
  { class: '5A', no: 5, stbk: '221429', name: 'M. Fathul Aiman Al-Kamil' },
  { class: '5A', no: 6, stbk: '221443', name: 'Alif Andika' },
  { class: '5A', no: 7, stbk: '221448', name: 'Candra Tri Ardiansyah' },
  { class: '5A', no: 8, stbk: '221491', name: 'Latif Syam' },
  { class: '5A', no: 9, stbk: '251749', name: 'Raihan Alwi' },

  
  { class: '4B', no: 1, stbk: '231638', name: 'Wulan Syafira' },
  { class: '4B', no: 2, stbk: '231614', name: 'Rinova Almira Sefi' },
  { class: '4B', no: 3, stbk: '231630', name: 'Melati' },
  { class: '4B', no: 4, stbk: '231634', name: 'Nadina Sofa Amaliya' },
  { class: '4B', no: 5, stbk: '231613', name: 'Nay Silla Azzahra' },
  { class: '4B', no: 6, stbk: '231641', name: 'Kurnia Nur Suci' },
  { class: '4B', no: 7, stbk: '231609', name: 'Arshinta Putri' },
  { class: '4B', no: 8, stbk: '231623', name: 'Mely Sabrina' },
  { class: '4B', no: 9, stbk: '231637', name: 'Nazwa Faitd Lathifah Naim' },
  { class: '4B', no: 10, stbk: '231648', name: 'Ranun Tuhrotul Qolbah' },
  { class: '4B', no: 11, stbk: '231639', name: 'Khusna Safitri' },
  { class: '4B', no: 12, stbk: '241717', name: 'Annisa Aulia Putri' },
  { class: '4B', no: 13, stbk: '231636', name: 'Shela Aulia Dewi' },
  { class: '4B', no: 14, stbk: '231649', name: 'Zahirotun Naila Afifah' },
  { class: '4B', no: 15, stbk: '231628', name: 'Afifah Aini Sarah' },
  { class: '4B', no: 16, stbk: '231617', name: 'Sahdia Ainun' },
  { class: '4B', no: 17, stbk: '231622', name: 'Desi Safitri' },
  { class: '4B', no: 18, stbk: '261819', name: 'Mutiara Nurjannah' },

  
  { class: '4A', no: 1, stbk: '231556', name: 'Dimas Faizul Anwar' },
  { class: '4A', no: 2, stbk: '231579', name: 'Diandra Wahyu Mahesa' },
  { class: '4A', no: 3, stbk: '231589', name: 'Jastin Ramdhani Aritonang' },
  { class: '4A', no: 4, stbk: '231583', name: 'Arif Setiawan' },
  { class: '4A', no: 5, stbk: '231557', name: 'Adi Alamsyah' },
  { class: '4A', no: 6, stbk: '231575', name: 'Muhammad Alfareza' },
  { class: '4A', no: 7, stbk: '231561', name: 'Rizki Ahmad' },
  { class: '4A', no: 8, stbk: '231578', name: 'Ibnu Solihin' },
  { class: '4A', no: 9, stbk: '231573', name: 'Khanza Al-Kholiki Nasution' },
  { class: '4A', no: 10, stbk: '231597', name: 'Rafli Riandani' },
  { class: '4A', no: 11, stbk: '231581', name: 'M. Arif Al- Kusairi' },
  { class: '4A', no: 12, stbk: '231576', name: 'Niko Syawal Hidayah' },
  { class: '4A', no: 13, stbk: '231587', name: 'Raihan Hanafi' },
  { class: '4A', no: 14, stbk: '231603', name: 'Agus Obet' },
  { class: '4A', no: 15, stbk: '231590', name: 'Ahmad Husen' },
  { class: '4A', no: 16, stbk: '251752', name: 'Rizky Alhafis' },
  { class: '4A', no: 17, stbk: '261793', name: 'Aditya Arsadita' },
  { class: '4A', no: 18, stbk: '261794', name: 'Reza Syahputra' },

  
  { class: '3B', no: 1, stbk: '241700', name: 'Intan Kesyanova Hsb' },
  { class: '3B', no: 2, stbk: '241694', name: "Nabila A'zahra" },
  { class: '3B', no: 3, stbk: '241705', name: 'Nadya Zahwa Saragih' },
  { class: '3B', no: 4, stbk: '241709', name: 'Azzura Nurul Asyikin' },
  { class: '3B', no: 5, stbk: '241690', name: 'Aulia Khusnul Masitoh' },
  { class: '3B', no: 6, stbk: '241692', name: 'Aprilia Az-Zahra' },
  { class: '3B', no: 7, stbk: '241701', name: 'Putri Nayla' },
  { class: '3B', no: 8, stbk: '241691', name: 'Ainia Azmiatul Amin' },
  { class: '3B', no: 9, stbk: '241707', name: 'Zakiyyah Ramadhan Diyanti' },
  { class: '3B', no: 10, stbk: '241693', name: 'Asyifa Syahira' },
  { class: '3B', no: 11, stbk: '241697', name: 'Aliya lestari' },
  { class: '3B', no: 12, stbk: '241702', name: 'Naila Nanda Putri' },
  { class: '3B', no: 13, stbk: '241704', name: 'Putri Erdiani' },
  { class: '3B', no: 14, stbk: '241703', name: 'Fadilla Aulia Febriana' },
  { class: '3B', no: 15, stbk: '241687', name: 'Annisa Masfufah' },
  { class: '3B', no: 16, stbk: '241686', name: 'Neisya Almahera' },
  { class: '3B', no: 17, stbk: '241708', name: 'Dwi Apriliyanti' },
  { class: '3B', no: 18, stbk: '241689', name: 'Ibbryyana' },
  { class: '3B', no: 19, stbk: '241711', name: 'Ratih Purwasih' },
  { class: '3B', no: 20, stbk: '241695', name: 'Aulia Salsabila Br Munthe' },
  { class: '3B', no: 21, stbk: '241706', name: 'Naila Syahada' },
  { class: '3B', no: 22, stbk: '241699', name: 'Jesika Novi Adila' },

  
  { class: '3A', no: 1, stbk: '241682', name: 'Agung Junior' },
  { class: '3A', no: 2, stbk: '241666', name: 'Reyhan arrasyid' },
  { class: '3A', no: 3, stbk: '241680', name: 'Naufal Zahir Azmi' },
  { class: '3A', no: 4, stbk: '241679', name: 'Alvin Zaky Almunziri' },
  { class: '3A', no: 5, stbk: '241665', name: 'Muhammad Rifaldo' },
  { class: '3A', no: 6, stbk: '241662', name: 'Kafqa Almuqodis' },
  { class: '3A', no: 7, stbk: '241664', name: 'Wendi Syahputra' },
  { class: '3A', no: 8, stbk: '241677', name: 'M. Irfan Fadhilah' },
  { class: '3A', no: 9, stbk: '241672', name: 'Muhammad Adiba' },
  { class: '3A', no: 10, stbk: '241663', name: 'Ibnu Muhammad Risky' },
  { class: '3A', no: 11, stbk: '241670', name: 'Supriyadi kelana' },
  { class: '3A', no: 12, stbk: '241714', name: 'Rojali' },
  { class: '3A', no: 13, stbk: '241674', name: 'Irama Bastian Valentino' },
  { class: '3A', no: 14, stbk: '241684', name: 'Daffa Faeza' },
  { class: '3A', no: 15, stbk: '241669', name: 'Muhammad Fandy' },
  { class: '3A', no: 16, stbk: '241675', name: 'Putra Winata' },
  { class: '3A', no: 17, stbk: '241658', name: 'Muhammad Rizky' },
  { class: '3A', no: 18, stbk: '241673', name: 'Fadil Ishak Fauzi' },
  { class: '3A', no: 19, stbk: '241685', name: 'Risky Muhammad Dani Lubis' },
  { class: '3A', no: 20, stbk: '241713', name: 'Muhammad Jiha Nalpin' },

  
  { class: '2B', no: 1, stbk: '251766', name: 'Siti Alya Nurafifa' },
  { class: '2B', no: 2, stbk: '251770', name: 'Putri Rafika Masnun' },
  { class: '2B', no: 3, stbk: '251757', name: 'Roudhotul Hasana' },
  { class: '2B', no: 4, stbk: '251765', name: 'Vinny Asya Qila' },
  { class: '2B', no: 5, stbk: '251763', name: 'Nadya Lativa' },
  { class: '2B', no: 6, stbk: '251771', name: 'Salsabila' },
  { class: '2B', no: 7, stbk: '251758', name: 'Syavita Amanda' },
  { class: '2B', no: 8, stbk: '251772', name: 'Zaskia Anggraini' },
  { class: '2B', no: 9, stbk: '251759', name: 'Novi Amelia' },
  { class: '2B', no: 10, stbk: '251789', name: 'Siti Zubaidah' },
  { class: '2B', no: 11, stbk: '251764', name: 'Iffa Astila Rahma' },
  { class: '2B', no: 12, stbk: '251775', name: "Nisa'Ul Husna Nasution" },
  { class: '2B', no: 13, stbk: '251785', name: "Siti Nur'aini" },
  { class: '2B', no: 14, stbk: '251778', name: 'Fitri Annisa' },
  { class: '2B', no: 15, stbk: '251774', name: 'Qaisarah Syahirah Wirata' },
  { class: '2B', no: 16, stbk: '251777', name: 'Syaqila Afiqih Br. Hasibuan' },
  { class: '2B', no: 17, stbk: '251762', name: 'Airen Sidqia Salbia Mansyur' },
  { class: '2B', no: 18, stbk: '251781', name: 'Hanifah Salsabil' },
  { class: '2B', no: 19, stbk: '251779', name: 'Nabilah Sakhi Dalimunte' },
  { class: '2B', no: 20, stbk: '251790', name: 'Cantika Syahfitri' },
  { class: '2B', no: 21, stbk: '251761', name: 'Syauqina Zharifah Atharta' },
  { class: '2B', no: 22, stbk: '251783', name: 'Ade Nur Elyza' },
  { class: '2B', no: 23, stbk: '251756', name: 'Alya Sifa' },
  { class: '2B', no: 24, stbk: '251773', name: 'Alika Nazwa Kalisyah' },
  { class: '2B', no: 25, stbk: '251760', name: 'Afdela Sulistiyani' },

  
  { class: '2A', no: 1, stbk: '251748', name: 'Daffa Mulia' },
  { class: '2A', no: 2, stbk: '251731', name: 'Amin Nur Ramadhani' },
  { class: '2A', no: 3, stbk: '251736', name: 'Rizki Fadilah Ginting' },
  { class: '2A', no: 4, stbk: '251740', name: 'Alhadi Fauzan' },
  { class: '2A', no: 5, stbk: '251724', name: 'Afdal Alpaiez' },
  { class: '2A', no: 6, stbk: '251751', name: 'Anshori Aman Tarigan' },
  { class: '2A', no: 7, stbk: '251733', name: 'Adnin Nasution' },
  { class: '2A', no: 8, stbk: '251747', name: 'Ilham Alfazri Aritonang' },
  { class: '2A', no: 9, stbk: '251722', name: 'Rifky Alfaiz Ramadhan' },
  { class: '2A', no: 10, stbk: '251746', name: 'Irvan Yusuf Sinurat' },
  { class: '2A', no: 11, stbk: '251729', name: 'Azam Fikri Ramadhan' },
  { class: '2A', no: 12, stbk: '251750', name: 'Anugrah Ahmad Reyzeva' },
  { class: '2A', no: 13, stbk: '251737', name: 'Aprillia Fadila' },
  { class: '2A', no: 14, stbk: '251730', name: 'Rifal Wildan Firmansyah' },
  { class: '2A', no: 15, stbk: '251723', name: 'Alif Alfareza' },
  { class: '2A', no: 16, stbk: '251725', name: 'Dhanar Satrio Wibowo' },
  { class: '2A', no: 17, stbk: '251753', name: 'Hadrian Dava' },
  { class: '2A', no: 18, stbk: '251726', name: 'Yaqzhan Al Farid' },
  { class: '2A', no: 19, stbk: '251727', name: 'Tio Satrio' },
  { class: '2A', no: 20, stbk: '251754', name: 'Muhammad Nazuan' },
  { class: '2A', no: 21, stbk: '251744', name: 'Subhan Mustadi Rambe' },
  { class: '2A', no: 22, stbk: '251728', name: 'Diki Andrian' },
  { class: '2A', no: 23, stbk: '251735', name: 'Pajar Anugrah Ginting' },
  { class: '2A', no: 24, stbk: '251741', name: 'Fadli Zaylani' },
  { class: '2A', no: 25, stbk: '251755', name: 'Rafi Rahmadhan Ghafar' },

  
  { class: '1B', no: 1, stbk: '261818', name: 'Mutiara Nurhasanah' },
  { class: '1B', no: 2, stbk: '261823', name: 'Desvita Nur Rahmah' },
  { class: '1B', no: 3, stbk: '261831', name: 'Asiyfa Zahra' },
  { class: '1B', no: 4, stbk: '261832', name: 'Nabila Khalifa Rahmani' },
  { class: '1B', no: 5, stbk: '261824', name: 'Jery Syafriani' },
  { class: '1B', no: 6, stbk: '261826', name: 'Syarifatun Nasiah' },
  { class: '1B', no: 7, stbk: '261827', name: 'Siti Rada Br Harahap' },
  { class: '1B', no: 8, stbk: '261821', name: 'Angelia' },
  { class: '1B', no: 9, stbk: '261830', name: 'Ashyfatu Amira' },
  { class: '1B', no: 10, stbk: '261828', name: 'Adzkia Nursyifa' },
  { class: '1B', no: 11, stbk: '261815', name: 'Citra Firliani' },
  { class: '1B', no: 12, stbk: '261829', name: 'Hafiza Salsabila' },
  { class: '1B', no: 13, stbk: '261810', name: 'Nafsa Althafunnisa' },
  { class: '1B', no: 14, stbk: '261811', name: 'Maysaroh Nur Jannah' },
  { class: '1B', no: 15, stbk: '261817', name: 'Lathifatul muyassaroh' },
  { class: '1B', no: 16, stbk: '261825', name: 'Jihan Talita Ulfa' },
  { class: '1B', no: 17, stbk: '261808', name: 'Elvi Zahara' },
  { class: '1B', no: 18, stbk: '261816', name: 'Feby Melani' },
  { class: '1B', no: 19, stbk: '261822', name: 'Ivy Nikita Maulin' },
  { class: '1B', no: 20, stbk: '261814', name: 'Aqila sallsabila' },
  { class: '1B', no: 21, stbk: '261813', name: 'Belvana Najwa Afifah' },
  { class: '1B', no: 22, stbk: '261812', name: 'Ayunda JuwitaBrewing' },

  
  { class: '1A', no: 1, stbk: '261796', name: 'Muhammad Luthfi zayyidan' },
  { class: '1A', no: 2, stbk: '261797', name: 'Sabiq Mirza Ukail' },
  { class: '1A', no: 3, stbk: '261798', name: 'Fakhri Hanif' },
  { class: '1A', no: 4, stbk: '261805', name: 'Fitrah Aditia' },
  { class: '1A', no: 5, stbk: '261795', name: 'Hidayat agung Irawan' },
  { class: '1A', no: 6, stbk: '261799', name: 'Zaki Akmal' },
  { class: '1A', no: 7, stbk: '261800', name: 'Rifky Al-Aqram' },
  { class: '1A', no: 8, stbk: '261803', name: 'Arsya Nugie Ahmad Fahrezi' },
  { class: '1A', no: 9, stbk: '261801', name: 'Farhan Hafiz' },
  { class: '1A', no: 10, stbk: '261806', name: 'Alif Julian' },
  { class: '1A', no: 11, stbk: '261807', name: 'Muhammad Azka Muhiddin' },
  { class: '1A', no: 12, stbk: '261804', name: 'Alfin Nauval' },
  { class: '1A', no: 13, stbk: '261833', name: 'Parana Wibawa Sianipar' },
  { class: '1A', no: 14, stbk: '261834', name: 'Zikri Ahbar Oktavian' }
];


data.find(s => s.class === '1B' && s.no === 22).name = 'Ayunda Juwita lestari';

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

const kamarMap = {
  '1A': 'Kamar Salman Al-Farisi',
  '2A': 'Kamar Abu Bakar Ash-Shiddiq',
  '3A': 'Kamar Umar Bin Khattab',
  '4A': 'Kamar Utsman Bin Affan',
  '5A': 'Kamar Ali Bin Abi Thalib',
  '6A': 'Kamar Khalid Bin Walid',
  '1B': 'Kamar Siti Khadijah',
  '2B': 'Kamar Siti Aisyah',
  '3B': 'Kamar Siti Fatimah',
  '4B': 'Kamar Hafshah Binti Umar',
  '5B': 'Kamar Ummu Salamah',
  '6B': 'Kamar Maryam Binti Imran'
};

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    
    await client.query('DELETE FROM penilaian');
    await client.query('DELETE FROM absensi');
    
    
    await client.query('DELETE FROM santri');

    
    const classesList = [
      { id: 'cls-1a', name: '1A', gender: 'Putra', wali: 'Ustadz Fauzan Al-Banjari', guru: 'user-guru-ustadz' },
      { id: 'cls-1b', name: '1B', gender: 'Putri', wali: 'Ustadzah Maryam, S.Pd.I', guru: 'user-guru-ustadzah' },
      { id: 'cls-2a', name: '2A', gender: 'Putra', wali: 'Ustadz Ilham Wahyudi, S.Pd.', guru: 'user-guru-ilham' },
      { id: 'cls-2b', name: '2B', gender: 'Putri', wali: 'Ustadzah Nurul Hidayah', guru: 'user-guru-nurul' },
      { id: 'cls-3a', name: '3A', gender: 'Putra', wali: 'Ust. Rahmat Hidayat', guru: 'user-pengasuhan' },
      { id: 'cls-3b', name: '3B', gender: 'Putri', wali: 'Ustadzah Halimah, S.Pd.I', guru: 'user-pengasuhan-bk' },
      { id: 'cls-4a', name: '4A', gender: 'Putra', wali: 'Doli Irvansyah, Lc', guru: 'user-bk-doli' },
      { id: 'cls-4b', name: '4B', gender: 'Putri', wali: 'Siti Salmah, S.Pd', guru: 'user-bk-salmah' },
      { id: 'cls-5a', name: '5A', gender: 'Putra', wali: 'Muhammad Syeikhul Haq Daulay', guru: 'user-bk-syeikhul' },
      { id: 'cls-5b', name: '5B', gender: 'Putri', wali: 'Nuriyana Azizah', guru: 'user-bk-nuriyana' },
      { id: 'cls-6a', name: '6A', gender: 'Putra', wali: 'Willy Agustino', guru: 'user-bk-willy' },
      { id: 'cls-6b', name: '6B', gender: 'Putri', wali: 'Suci Ayu Prihatin', guru: 'user-bk-suci' }
    ];

    
    await client.query("DELETE FROM classes WHERE name IN ('1C', '1D', '2C', '2D')");

    for (const c of classesList) {
      await client.query(`
        INSERT INTO classes (id, name, gender, wali_kelas, guru_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          gender = EXCLUDED.gender,
          wali_kelas = EXCLUDED.wali_kelas,
          guru_id = EXCLUDED.guru_id
      `, [c.id, c.name, c.gender, c.wali, c.guru]);
    }

    
    let insertedCount = 0;
    for (const s of data) {
      const isPutra = s.class.endsWith('A');
      const gender = isPutra ? 'Putra' : 'Putri';
      const asrama = isPutra ? 'Asrama Putra Kampus Mahato' : 'Asrama Putri Kampus Mahato';
      const kamar = kamarMap[s.class] || 'Kamar Mahato';
      const id = `santri-${s.stbk}`;
      const avatar = getInitials(s.name);
      const cleanName = s.name.trim();
      const waliName = `Wali ${cleanName.split(' ')[0]}`;
      const waliPhone = `0821${Math.floor(10000000 + Math.random() * 90000000)}`;

      await client.query(`
        INSERT INTO santri (
          id, nis, name, gender, class, asrama, kamar,
          base_score, current_score, status, avatar,
          wali_name, wali_phone, total_hadir, total_alpa
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          70.000, 70.000, 'Baik', $8,
          $9, $10, 28, 0
        )
      `, [
        id, s.stbk, cleanName, gender, s.class, asrama, kamar,
        avatar, waliName, waliPhone
      ]);
      insertedCount++;
    }

    await client.query('COMMIT');
    console.log('SUCCESS! Inserted students:', insertedCount);

    
    const totalRes = await client.query('SELECT count(*) FROM santri');
    console.log('Verified database santri count:', totalRes.rows[0].count);

    const classStats = await client.query(`
      SELECT class, gender, count(*) as count 
      FROM santri 
      GROUP BY class, gender 
      ORDER BY class ASC
    `);
    console.log('Class stats:');
    console.table(classStats.rows);

    const genderStats = await client.query(`
      SELECT gender, count(*) as count 
      FROM santri 
      GROUP BY gender 
      ORDER BY gender ASC
    `);
    console.log('Gender stats:');
    console.table(genderStats.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during transaction:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
