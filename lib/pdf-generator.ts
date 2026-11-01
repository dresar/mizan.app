import { jsPDF } from "jspdf";
import { Santri, PenilaianRecord, AbsensiRecord } from "./mock-data";

export function generateSantriPdf(
  santri: Santri,
  penilaianList: PenilaianRecord[] = [],
  absensiList: AbsensiRecord[] = [],
  printDate = "1 November 2026"
) {
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

  let predikatLabel = "JAYYID (BAIK)";
  if (santri.currentScore >= 90) predikatLabel = "MUMTAZ (ISTIMEWA)";
  else if (santri.currentScore >= 80) predikatLabel = "JAYYID JIDDAN (SANGAT BAIK)";
  else if (santri.currentScore < 60) predikatLabel = "PEMBINAAN KHUSUS";

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
  doc.text(`${santri.currentScore.toFixed(3).replace(".", ",")} / 99,000`, margin + statBoxWidth / 2, statBoxY + 12.5, { align: "center" });
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
  doc.text(`Hadir: ${santri.totalHadir || 28} Hari | Alpa: ${santri.totalAlpa || 0}`, statBox3X + statBoxWidth / 2, statBoxY + 17, { align: "center" });

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

  doc.text("Wali Kelas / Mudabbir Pembina,", leftSignX, signY + 5);
  doc.text("Kepala Bagian Pengasuhan Pondok,", rightSignX, signY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("( .................................................... )", leftSignX, signY + 26);
  doc.text("( Ust. H. Ahmad Syukri, Lc. )", rightSignX, signY + 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Pembina Kedisiplinan Asrama", leftSignX, signY + 30);
  doc.text("Super Admin Pengasuhan MIZAN", rightSignX, signY + 30);

  const sanitizedName = santri.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Rapor_Akhlak_${sanitizedName}_${santri.nis}.pdf`);
}
