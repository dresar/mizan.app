import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { KOP_SURAT_BASE64 } from "./kop-surat-base64";

export interface GuruReportRow {
  no: number;
  id: string;
  name: string;
  gender: string;
  assignedClass: string;
  asrama: string;
  sholatReportCount: number;
  adabReportCount: number;
  totalReportCount: number;
  lastActive: string;
  statusKeaktifan: "Aktif Lapor" | "Jarang Lapor";
  evaluasiCatatan: string;
}

export function exportGuruReportExcel(rows: GuruReportRow[], periodLabel: string): void {
  const exportData = rows.map((r) => ({
    "No": r.no,
    "Nama Pembina / Asatidzah": r.name,
    "Jenis Kelamin": r.gender,
    "Kelas Binaan": `Kelas ${r.assignedClass}`,
    "Asrama": r.asrama,
    "Laporan Presensi Sholat (Kali)": r.sholatReportCount,
    "Laporan Catatan Adab (Kali)": r.adabReportCount,
    "Total Akumulasi Laporan": r.totalReportCount,
    "Aktivitas Terakhir": r.lastActive,
    "Status Keaktifan": r.statusKeaktifan,
    "Tindak Lanjut / Catatan Evaluasi": r.evaluasiCatatan
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const colWidths = [
    { wch: 6 },
    { wch: 30 },
    { wch: 14 },
    { wch: 16 },
    { wch: 22 },
    { wch: 28 },
    { wch: 26 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },
    { wch: 36 }
  ];
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap_Keaktifan_Guru");

  const safePeriod = periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Laporan-Keaktifan-Asatidzah-Mizan-${safePeriod}-${dateStr}.xlsx`);
}

export async function generateGuruReportPdf(rows: GuruReportRow[], periodLabel: string): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  try {
    doc.addImage(KOP_SURAT_BASE64, "JPEG", margin, 4.5, contentWidth, 24);
  } catch {
    void 0;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(23, 32, 51);
  doc.text("LAPORAN REKAPITULASI & EVALUASI KEAKTIFAN PELAPORAN ASATIDZAH", pageWidth / 2, 33, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode Evaluasi: ${periodLabel} • Dicetak Otomatis pada ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth / 2, 37.5, { align: "center" });

  const totalTeachers = rows.length;
  const aktifCount = rows.filter((r) => r.statusKeaktifan === "Aktif Lapor").length;
  const jarangCount = rows.filter((r) => r.statusKeaktifan === "Jarang Lapor").length;

  const statBoxY = 41;
  const boxW = contentWidth / 3 - 3;
  const boxH = 12;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, statBoxY, boxW, boxH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL PEMBINA TERDATA", margin + 4, statBoxY + 4.5);
  doc.setFontSize(11);
  doc.setTextColor(23, 32, 51);
  doc.text(`${totalTeachers} Asatidzah`, margin + 4, statBoxY + 9.5);

  const box2X = margin + boxW + 4.5;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(box2X, statBoxY, boxW, boxH, 1.5, 1.5, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text("PEMBINA AKTIF LAPOR", box2X + 4, statBoxY + 4.5);
  doc.setFontSize(11);
  doc.text(`${aktifCount} Orang`, box2X + 4, statBoxY + 9.5);

  const box3X = box2X + boxW + 4.5;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(box3X, statBoxY, boxW, boxH, 1.5, 1.5, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text("JARANG LAPOR (PERLU FOLLOW-UP)", box3X + 4, statBoxY + 4.5);
  doc.setFontSize(11);
  doc.text(`${jarangCount} Orang`, box3X + 4, statBoxY + 9.5);

  let currentY = 57;
  const tableHeaderH = 7;
  const rowH = 6;

  doc.setFillColor(27, 77, 62);
  doc.rect(margin, currentY, contentWidth, tableHeaderH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  doc.text("NO", margin + 2, currentY + 4.8);
  doc.text("NAMA ASATIDZAH / PEMBINA", margin + 12, currentY + 4.8);
  doc.text("GENDER", margin + 68, currentY + 4.8);
  doc.text("BINAAN KELAS", margin + 86, currentY + 4.8);
  doc.text("ASRAMA", margin + 114, currentY + 4.8);
  doc.text("SHOLAT", margin + 154, currentY + 4.8, { align: "center" });
  doc.text("ADAB", margin + 172, currentY + 4.8, { align: "center" });
  doc.text("TOTAL", margin + 190, currentY + 4.8, { align: "center" });
  doc.text("AKTIVITAS TERAKHIR", margin + 204, currentY + 4.8);
  doc.text("STATUS", margin + 242, currentY + 4.8);

  currentY += tableHeaderH;

  rows.forEach((r, idx) => {
    if (currentY + rowH > pageHeight - 20) {
      doc.addPage("a4", "landscape");
      currentY = 15;

      doc.setFillColor(27, 77, 62);
      doc.rect(margin, currentY, contentWidth, tableHeaderH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text("NO", margin + 2, currentY + 4.8);
      doc.text("NAMA ASATIDZAH / PEMBINA", margin + 12, currentY + 4.8);
      doc.text("GENDER", margin + 68, currentY + 4.8);
      doc.text("BINAAN KELAS", margin + 86, currentY + 4.8);
      doc.text("ASRAMA", margin + 114, currentY + 4.8);
      doc.text("SHOLAT", margin + 154, currentY + 4.8, { align: "center" });
      doc.text("ADAB", margin + 172, currentY + 4.8, { align: "center" });
      doc.text("TOTAL", margin + 190, currentY + 4.8, { align: "center" });
      doc.text("AKTIVITAS TERAKHIR", margin + 204, currentY + 4.8);
      doc.text("STATUS", margin + 242, currentY + 4.8);

      currentY += tableHeaderH;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, rowH, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(23, 32, 51);

    doc.text(String(r.no), margin + 2, currentY + 4.2);
    doc.text(r.name.length > 28 ? r.name.substring(0, 26) + "..." : r.name, margin + 12, currentY + 4.2);
    doc.text(r.gender, margin + 68, currentY + 4.2);
    doc.text(`Kelas ${r.assignedClass}`, margin + 86, currentY + 4.2);
    doc.text(r.asrama.length > 18 ? r.asrama.substring(0, 16) + "..." : r.asrama, margin + 114, currentY + 4.2);

    doc.text(String(r.sholatReportCount), margin + 154, currentY + 4.2, { align: "center" });
    doc.text(String(r.adabReportCount), margin + 172, currentY + 4.2, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(String(r.totalReportCount), margin + 190, currentY + 4.2, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.text(r.lastActive, margin + 204, currentY + 4.2);

    if (r.statusKeaktifan === "Aktif Lapor") {
      doc.setTextColor(21, 128, 61);
      doc.text("Aktif Lapor", margin + 242, currentY + 4.2);
    } else {
      doc.setTextColor(185, 28, 28);
      doc.text("Jarang Lapor", margin + 242, currentY + 4.2);
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + rowH, margin + contentWidth, currentY + rowH);

    currentY += rowH;
  });

  const signY = currentY + 8 > pageHeight - 25 ? pageHeight - 22 : currentY + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Mengetahui,", margin + 15, signY);
  doc.text("Pimpinan Pesantren Raudhatussalam Mahato", margin + 15, signY + 4);
  doc.text("Ust. H. Ahmad Syukri, Lc.", margin + 15, signY + 16);

  doc.text("Mahato, " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), pageWidth - margin - 50, signY);
  doc.text("Koordinator Bagian Pengasuhan Santri", pageWidth - margin - 50, signY + 4);
  doc.text("Ust. Muhammad Fatihuddin, S.Pd.I.", pageWidth - margin - 50, signY + 16);

  const safePeriod = periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan-Keaktifan-Asatidzah-Mizan-${safePeriod}-${dateStr}.pdf`);
}
