import { jsPDF } from "jspdf";
import { Santri, PenilaianRecord, AbsensiRecord } from "./mock-data";

export async function generateSantriPdf(
  santri: Santri,
  penilaianList: PenilaianRecord[] = [],
  absensiList: AbsensiRecord[] = [],
  printDate = "1 November 2026"
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  doc.setDrawColor(27, 77, 62);
  doc.setLineWidth(0.8);
  doc.line(margin, 28, pageWidth - margin, 28);
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.3);
  doc.line(margin, 29.5, pageWidth - margin, 29.5);

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(27, 77, 62);
  doc.text("PONDOK PESANTREN MODERN RAUDHATUSSALAM MAHATO", pageWidth / 2, 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Kecamatan Tambusai Utara, Kabupaten Rokan Hulu, Riau | Kode Pos: 28558", pageWidth / 2, 21, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(23, 32, 51);
  doc.text("LEMBAR BUKU KENDALI AKHLAK, ADAB & KEDISIPLINAN SANTRI (MIZAN)", pageWidth / 2, 36, { align: "center" });

  doc.setFillColor(250, 247, 238);
  doc.setDrawColor(226, 235, 244);
  doc.roundedRect(margin, 41, contentWidth, 27, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(27, 77, 62);
  doc.text("IDENTITAS SANTRI", margin + 4, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(23, 32, 51);

  doc.text(`Nama Lengkap   : ${santri.name}`, margin + 4, 52);
  doc.text(`NIS / Induk       : ${santri.nis}`, margin + 4, 57);
  doc.text(`Kelas / Kategori : Kelas ${santri.class} (${santri.gender})`, margin + 4, 62);

  const rightColX = margin + 98;
  doc.text(`Wali Santri    : ${santri.waliName || "Bapak / Ibu Wali"}`, rightColX, 52);
  doc.text(`Kontak Wali   : ${santri.waliPhone || "0812-xxxx-xxxx"}`, rightColX, 57);
  doc.text(`Tanggal Rekap : ${printDate}`, rightColX, 62);

  const totalHasanah = penilaianList
    .filter((p) => p.type === "HASANAH")
    .reduce((sum, p) => sum + p.score, 0);

  const totalSayyiah = penilaianList
    .filter((p) => p.type === "SAYYIAH")
    .reduce((sum, p) => sum + Math.abs(p.score), 0);

  const currentScore = typeof santri.currentScore === "number" && !isNaN(santri.currentScore) ? santri.currentScore : 70;
  let predikatLabel = "JAYYID (BAIK)";
  if (currentScore >= 90) predikatLabel = "MUMTAZ (ISTIMEWA)";
  else if (currentScore >= 80) predikatLabel = "JAYYID JIDDAN (SANGAT BAIK)";
  else if (currentScore < 60) predikatLabel = "PEMBINAAN KHUSUS";

  const statBoxY = 72;
  const statBoxWidth = (contentWidth - 6) / 3;

  doc.setFillColor(244, 246, 248);
  doc.setDrawColor(226, 235, 244);
  doc.roundedRect(margin, statBoxY, statBoxWidth, 20, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("SKOR AKHLAK SAAT INI", margin + statBoxWidth / 2, statBoxY + 5.5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(27, 77, 62);
  doc.text(`${currentScore.toFixed(3).replace(".", ",")} / 99,000`, margin + statBoxWidth / 2, statBoxY + 12.5, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Skor Awal Baku: 70,000`, margin + statBoxWidth / 2, statBoxY + 17, { align: "center" });

  const statBox2X = margin + statBoxWidth + 3;
  doc.setFillColor(244, 246, 248);
  doc.roundedRect(statBox2X, statBoxY, statBoxWidth, 20, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("AKUMULASI PRESTASI / MINUS", statBox2X + statBoxWidth / 2, statBoxY + 5.5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(6, 95, 70);
  doc.text(`+${totalHasanah.toFixed(3).replace(".", ",")}`, statBox2X + statBoxWidth / 2 - 12, statBoxY + 12.5, { align: "center" });
  doc.setTextColor(153, 27, 27);
  doc.text(`-${totalSayyiah.toFixed(3).replace(".", ",")}`, statBox2X + statBoxWidth / 2 + 12, statBoxY + 12.5, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${penilaianList.length} Catatan Perilaku`, statBox2X + statBoxWidth / 2, statBoxY + 17, { align: "center" });

  const statBox3X = statBox2X + statBoxWidth + 3;
  doc.setFillColor(244, 246, 248);
  doc.roundedRect(statBox3X, statBoxY, statBoxWidth, 20, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("PREDIKAT & KEHADIRAN", statBox3X + statBoxWidth / 2, statBoxY + 5.5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(168, 131, 62);
  doc.text(predikatLabel, statBox3X + statBoxWidth / 2, statBoxY + 12, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(23, 32, 51);
  const totalHadir = santri.totalHadir ?? (absensiList.length > 0 ? absensiList.filter((a) => a.status === "Hadir").length : 28);
  const totalAlpa = santri.totalAlpa ?? (absensiList.length > 0 ? absensiList.filter((a) => a.status === "Alpa").length : 0);
  doc.text(`Hadir: ${totalHadir} Hari | Alpa: ${totalAlpa}`, statBox3X + statBoxWidth / 2, statBoxY + 17, { align: "center" });

  let curY = 98;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(27, 77, 62);
  doc.text("RINCIAN CATATAN AKHLAK & KEDISIPLINAN", margin, curY);

  curY += 3.5;
  doc.setFillColor(27, 77, 62);
  doc.rect(margin, curY, contentWidth, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("NO", margin + 2, curY + 4.8);
  doc.text("TANGGAL", margin + 12, curY + 4.8);
  doc.text("RINCIAN INDIKATOR PERILAKU", margin + 34, curY + 4.8);
  doc.text("KATEGORI", margin + 118, curY + 4.8);
  doc.text("BOBOT", margin + 148, curY + 4.8);
  doc.text("PENCATAT", margin + 165, curY + 4.8);

  curY += 7;

  const displayPenilaian = penilaianList.slice(0, 12);
  if (displayPenilaian.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Belum ada catatan pelanggaran atau prestasi khusus yang tercatat dalam sistem.", margin + 4, curY + 7);
    curY += 12;
  } else {
    displayPenilaian.forEach((p, index) => {
      if (curY > pageHeight - 55) return;

      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, curY, contentWidth, 6.5, "F");

      doc.setDrawColor(226, 235, 244);
      doc.setLineWidth(0.2);
      doc.line(margin, curY + 6.5, pageWidth - margin, curY + 6.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(23, 32, 51);

      doc.text(String(index + 1), margin + 2, curY + 4.5);
      const dateStr = p.createdAt ? p.createdAt.split(" ")[0] : "31/10/2026";
      doc.text(dateStr, margin + 12, curY + 4.5);

      const truncatedText = p.indicatorText.length > 46 ? p.indicatorText.substring(0, 44) + "..." : p.indicatorText;
      doc.text(truncatedText, margin + 34, curY + 4.5);

      const catStr = (p.category || "Akhlak").substring(0, 16);
      doc.text(catStr, margin + 118, curY + 4.5);

      const scoreStr = p.type === "HASANAH" ? `+${p.score.toFixed(3).replace(".", ",")}` : `-${Math.abs(p.score).toFixed(3).replace(".", ",")}`;
      if (p.type === "HASANAH") {
        doc.setTextColor(6, 95, 70);
      } else {
        doc.setTextColor(153, 27, 27);
      }
      doc.setFont("helvetica", "bold");
      doc.text(scoreStr, margin + 148, curY + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const recorder = (p.guruName || "Pembina").substring(0, 10);
      doc.text(recorder, margin + 165, curY + 4.5);

      curY += 6.5;
    });
  }

  const signY = pageHeight - 42;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(23, 32, 51);

  doc.text(`Mahato, ${printDate}`, pageWidth - margin - 50, signY);

  const leftSignX = margin + 10;
  const rightSignX = pageWidth - margin - 50;

  doc.text("Wali Kelas / Ustadz Pembina,", leftSignX, signY + 5);
  doc.text("Kepala Bagian Pengasuhan Pondok,", rightSignX, signY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("( .................................................... )", leftSignX, signY + 26);
  doc.text("( Ust. H. Ahmad Syukri, Lc. )", rightSignX, signY + 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Pembina Kedisiplinan Asrama", leftSignX, signY + 30);
  doc.text("Super Admin Pengasuhan MIZAN", rightSignX, signY + 30);

  const safeName = (santri.name || "Santri").replace(/[^a-zA-Z0-9]/g, "_");
  const safeNis = santri.nis || "000";
  const filename = `Rapor_Akhlak_${safeName}_${safeNis}.pdf`;

  if (typeof window === "undefined") {
    return;
  }

  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(blobUrl, "_blank");
  }

  setTimeout(() => {
    if (anchor.parentNode) {
      document.body.removeChild(anchor);
    }
    URL.revokeObjectURL(blobUrl);
  }, 4000);
}

export async function generateNotaPoinPdf(
  santri: Santri,
  record: PenilaianRecord,
  staffName = "Staf Pengasuhan"
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  doc.setDrawColor(27, 77, 62);
  doc.setLineWidth(0.8);
  doc.line(margin, 28, pageWidth - margin, 28);
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.3);
  doc.line(margin, 29.5, pageWidth - margin, 29.5);

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(27, 77, 62);
  doc.text("PONDOK PESANTREN MODERN RAUDHATUSSALAM MAHATO", pageWidth / 2, 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Kecamatan Tambusai Utara, Kabupaten Rokan Hulu, Riau | Kode Pos: 28558", pageWidth / 2, 21, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(23, 32, 51);
  doc.text("BERITA ACARA & NOTA PENGESAHAN POIN PERILAKU SANTRI", pageWidth / 2, 36, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Asas Validasi & Hak Sanggah (Due Process) Kedisiplinan Pondok", pageWidth / 2, 40, { align: "center" });

  doc.setFillColor(250, 247, 238);
  doc.setDrawColor(226, 235, 244);
  doc.roundedRect(margin, 46, contentWidth, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(27, 77, 62);
  doc.text("I. IDENTITAS SANTRI", margin + 4, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(23, 32, 51);

  doc.text(`Nama Lengkap   : ${santri.name}`, margin + 4, 58);
  doc.text(`Nomor Induk/NIS : ${santri.nis}`, margin + 4, 63);
  doc.text(`Kelas / Gender  : Kelas ${santri.class} (${santri.gender})`, margin + 4, 68);
  doc.text(`Wali Santri     : ${santri.waliName || "-"} (${santri.waliPhone || "-"})`, margin + 4, 73);

  const rightColX = margin + 105;
  doc.text(`Saldo Poin Saat Ini : ${santri.currentScore.toFixed(3)} Poin`, rightColX, 58);
  doc.text(`Status Disiplin     : ${santri.status}`, rightColX, 63);
  doc.text(`Kamar / Asrama      : ${santri.asrama || (santri.gender === "Putri" ? "Khadijah" : "Salman")}`, rightColX, 68);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 82, contentWidth, 68, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(27, 77, 62);
  doc.text("II. RINCIAN KEJADIAN & PENGURANGAN / PENAMBAHAN POIN", margin + 4, 88);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(23, 32, 51);

  const isHasanah = record.type === "HASANAH";
  const deltaText = (record.score > 0 ? "+" : "") + record.score.toFixed(3) + " Poin";

  doc.text(`Jenis Perkara    : ${isHasanah ? "Hasanah (Prestasi / Pemulihan Poin)" : "Sayyi'ah (Pelanggaran Disiplin)"}`, margin + 4, 95);
  doc.text(`Kategori Utama   : ${record.category}`, margin + 4, 101);
  doc.text(`Unsur / Butir    : ${record.unsurName}`, margin + 4, 107);
  doc.text(`Indikator Kasus  : ${record.indicatorText}`, margin + 4, 113);
  doc.text(`Dampak Skor Poin : ${deltaText} (${record.tingkat || "Sedang"})`, margin + 4, 119);

  const incDate = record.incidentDate || record.dateKey || record.date || "-";
  const incTime = record.incidentTime || "10:00 WIB";
  const loc = record.location || "Lingkungan Pondok";
  const witness = record.witnessName || "Staf Pengasuhan / Musyrif";

  doc.text(`Waktu Kejadian   : ${incDate} pukul ${incTime}`, margin + 4, 125);
  doc.text(`Tempat / Saksi   : ${loc} | Saksi: ${witness}`, margin + 4, 131);
  doc.text(`Catatan Pembina  : ${record.notes || "Tidak ada catatan tambahan"}`, margin + 4, 137);
  doc.text(`Waktu Pelaporan  : Dicatat dalam batas waktu baku < 2x24 Jam (${record.createdAt})`, margin + 4, 143);

  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin, 154, contentWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(133, 77, 14);
  doc.text("III. KETENTUAN HAK SANGGAH & PENANDATANGANAN BERITA ACARA", margin + 4, 160);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(113, 63, 18);
  doc.text("1. Pembina telah mengkonfirmasi langsung kejadian perkara kepada santri bersangkutan sebelum pengesahan.", margin + 4, 165);
  doc.text("2. Santri memiliki hak sanggah dalam waktu 1x24 jam sejak nota ini diterbitkan apabila merasa terdapat kekeliruan.", margin + 4, 170);
  doc.text("3. Nota yang ditandatangani sah mengikat sebagai buku kendali adab dan perilaku perorangan santri.", margin + 4, 175);

  const signY = 196;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(23, 32, 51);

  doc.text(`Mahato, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth - margin - 50, signY);

  const col1 = margin + 10;
  const col2 = pageWidth / 2 - 20;
  const col3 = pageWidth - margin - 55;

  doc.text("Santri Yang Bersangkutan,", col1, signY + 6);
  doc.text("Petugas / Guru Pelapor,", col2, signY + 6);
  doc.text("Kepala Bagian Pengasuhan,", col3, signY + 6);

  doc.setFont("helvetica", "bold");
  doc.text(`( ${santri.name} )`, col1, signY + 28);
  doc.text(`( ${record.guruName || staffName} )`, col2, signY + 28);
  doc.text("( Ust. H. Ahmad Syukri, Lc. )", col3, signY + 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`NIS. ${santri.nis}`, col1, signY + 32);
  doc.text("Pencatat Laporan", col2, signY + 32);
  doc.text("Pengasuhan Santri Raudhatussalam", col3, signY + 32);

  const filename = `Nota_Poin_${(santri.name || "Santri").replace(/[^a-zA-Z0-9]/g, "_")}_${record.id}.pdf`;

  if (typeof window === "undefined") return;

  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    if (anchor.parentNode) document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
  }, 4000);
}

export async function generateSuratPeringatanPdf(
  santri: Santri,
  spLevel: "SP 1" | "SP 2" | "SP 3" | "Pengembalian",
  staffName = "Bagian Pengasuhan Santri"
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  doc.setDrawColor(27, 77, 62);
  doc.setLineWidth(0.8);
  doc.line(margin, 28, pageWidth - margin, 28);
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.3);
  doc.line(margin, 29.5, pageWidth - margin, 29.5);

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(27, 77, 62);
  doc.text("PONDOK PESANTREN MODERN RAUDHATUSSALAM MAHATO", pageWidth / 2, 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Kecamatan Tambusai Utara, Kabupaten Rokan Hulu, Riau | Kode Pos: 28558", pageWidth / 2, 21, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(23, 32, 51);

  const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const docCode = spLevel.replace(/\s+/g, "");
  const yearNow = new Date().getFullYear();

  doc.text(`Nomor     : RDS/PENGASUHAN/${docCode}/026/${yearNow}`, margin, 36);
  doc.text(`Lampiran  : 1 (Satu) Berkas Berita Acara & Perjanjian`, margin, 41);
  doc.text(`Perihal   : ${spLevel === "Pengembalian" ? "SURAT KEPUTUSAN PENGEMBALIAN SANTRI" : `SURAT PERINGATAN RESMI (${spLevel})`}`, margin, 46);
  doc.text(`Mahato, ${todayStr}`, pageWidth - margin - 45, 36);

  doc.setFont("helvetica", "bold");
  doc.text("Kepada Yth.", margin, 54);
  doc.text(`Bapak/Ibu Orang Tua / Wali dari: ${santri.name}`, margin, 59);
  doc.setFont("helvetica", "normal");
  doc.text("Di Tempat", margin, 64);

  doc.setFont("helvetica", "italic");
  doc.text("Assalamu'alaikum Warahmatullahi Wabarakatuh,", margin, 73);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Dengan hormat, berdasarkan Buku Catatan Penilaian Sikap dan Perilaku Perorangan Santri Pesantren Modern " +
    "Raudhatussalam Mahato, bersama ini kami sampaikan evaluasi kedisiplinan dan poin adab putra/putri Bapak/Ibu sebagai berikut:",
    margin,
    80,
    { maxWidth: contentWidth, lineHeightFactor: 1.4 }
  );

  doc.setFillColor(250, 247, 238);
  doc.setDrawColor(226, 235, 244);
  doc.roundedRect(margin, 92, contentWidth, 28, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(27, 77, 62);
  doc.text(`Nama Santri         : ${santri.name}`, margin + 4, 98);
  doc.text(`Nomor Induk / NIS   : ${santri.nis}`, margin + 4, 104);
  doc.text(`Kelas / Kategori    : Kelas ${santri.class} (${santri.gender})`, margin + 4, 110);
  doc.text(`Akumulasi Skor Poin : ${santri.currentScore.toFixed(3)} Poin (Status: ${spLevel})`, margin + 4, 116);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(23, 32, 51);
  doc.text("TINDAKAN DISIPLIN DAN TINDAK LANJUT RESMI PONDOK:", margin, 127);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  let tindakanDesc = "";
  if (spLevel === "SP 1") {
    tindakanDesc =
      "Santri berada pada ambang batas poin 46 - 60. Staf Pengasuhan telah melakukan pemanggilan santri, penulisan " +
      "surat pengakuan kesalahan, serta penandatanganan surat perjanjian kedisiplinan. Orang tua/wali diwajibkan memberikan " +
      "bimbingan dan nasihat intensif agar ananda tidak mengulangi pelanggaran yang sama.";
  } else if (spLevel === "SP 2") {
    tindakanDesc =
      "Santri berada pada ambang batas poin 31 - 45. Berdasarkan ketentuan baku, Orang Tua / Wali Santri DIHARUSKAN HADIR " +
      "ke Pondok Pesantren untuk memenuhi panggilan musyawarah dengan Pimpinan & Staf Pengasuhan, serta ananda dijatuhi " +
      "hukuman edukatif penugasan khidmat dan kebersihan khusus selama 3 (tiga) hari berturut-turut.";
  } else if (spLevel === "SP 3") {
    tindakanDesc =
      "SURAT PERINGATAN TERAKHIR (SP 3). Santri berada pada ambang kritis 16 - 30 poin. Santri dijatuhi sanksi disiplin fisik edukatif " +
      "(potong botak untuk santri putra / pemakaian khimar khusus untuk santriwati putri), kewajiban setoran hafalan Surah Yasin, " +
      "Al-Waqi'ah, dan Ar-Rahman, serta penandatanganan Surat Perjanjian Bermaterai bahwa 1 pelanggaran sedang/berat berikutnya " +
      "akan mengakibatkan PEMULANGAN PERMANEN.";
  } else {
    tindakanDesc =
      "KEPUTUSAN PENGEMBALIAN SANTRI (0 - 15 Poin). Berdasarkan akumulasi pelanggaran yang telah mencapai batas pengembalian, " +
      "Pimpinan Pondok Pesantren Modern Raudhatussalam Mahato memutuskan dengan berat hati mengembalikan ananda secara resmi " +
      "kepada orang tua/wali santri (dikeluarkan dari pesantren) terhitung sejak tanggal surat keputusan ini.";
  }

  doc.text(tindakanDesc, margin, 133, { maxWidth: contentWidth, lineHeightFactor: 1.4 });

  doc.setFont("helvetica", "italic");
  doc.text(
    "Demikian surat ini kami sampaikan demi tegaknya adab, akhlak karimah, dan ketertiban bersama di lingkungan pondok. " +
    "Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.",
    margin,
    168,
    { maxWidth: contentWidth, lineHeightFactor: 1.4 }
  );

  doc.setFont("helvetica", "italic");
  doc.text("Wassalamu'alaikum Warahmatullahi Wabarakatuh.", margin, 184);

  const signY = 196;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(23, 32, 51);

  doc.text("Orang Tua / Wali Santri,", margin + 10, signY);
  doc.text("Kepala Bagian Pengasuhan,", pageWidth / 2 - 20, signY);
  doc.text("Pimpinan Pesantren,", pageWidth - margin - 50, signY);

  doc.setFont("helvetica", "bold");
  doc.text(`( ${santri.waliName || "...................................."} )`, margin + 10, signY + 28);
  doc.text(`( ${staffName} )`, pageWidth / 2 - 20, signY + 28);
  doc.text("( Ust. H. Ahmad Syukri, Lc. )", pageWidth - margin - 50, signY + 28);

  const filename = `${docCode}_${(santri.name || "Santri").replace(/[^a-zA-Z0-9]/g, "_")}_${santri.nis}.pdf`;

  if (typeof window === "undefined") return;

  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    if (anchor.parentNode) document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
  }, 4000);
}
