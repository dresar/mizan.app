import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '@/lib/utils';

interface DocumentSettings {
  kopSuratImage?: string;
  kopSuratHeight?: number;
  kopSuratOpacity?: number;
  showKopSurat?: boolean;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  watermarkText?: string;
  watermarkOpacity?: number;
}

export const getDataUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context error');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = (error) => reject(error);
  });
};

export const generatePdfFromTemplate = async (template: { content: string, orientation?: string }, data: any, settings: DocumentSettings = {}) => {
  const doc = new jsPDF({
    orientation: (template.orientation || settings.orientation || 'portrait') as 'portrait' | 'landscape',
    unit: 'mm',
    format: settings.paperSize || 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Replace placeholders in HTML content
  let htmlContent = template.content;
  
  // Flatten data for easier replacement (simple recursion or just top level)
  // For now simple replacement
  const replaceAll = (str: string, obj: any, prefix = '') => {
    let result = str;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
        result = replaceAll(result, obj[key], `${prefix}${key}.`);
      } else {
        const val = obj[key] === undefined || obj[key] === null ? '-' : obj[key];
        const placeholder = `{{${prefix}${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), String(val));
      }
    }
    return result;
  };
  
  htmlContent = replaceAll(htmlContent, data);
  
  // Also common date formats
  const today = new Date();
  htmlContent = htmlContent.replace(/{{tanggal_sekarang}}/g, formatDate(today));
  htmlContent = htmlContent.replace(/{{tahun_ajaran}}/g, `${today.getFullYear()}/${today.getFullYear() + 1}`);

  // Create a container to render HTML
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.width = `${pageWidth - (settings.marginLeft || 15) - (settings.marginRight || 15)}mm`;
  element.style.padding = '0';
  element.style.fontFamily = 'Arial, Helvetica, sans-serif';
  element.className = 'pdf-render-container';
  document.body.appendChild(element);

  try {
    await doc.html(element, {
      callback: (pdf) => {
        pdf.save(`${data.namaLengkap || 'Dokumen'}.pdf`);
      },
      x: settings.marginLeft || 15,
      y: settings.marginTop || 10,
      width: pageWidth - (settings.marginLeft || 15) - (settings.marginRight || 15),
      windowWidth: 800, // Adjust based on CSS pixel ratio
      autoPaging: 'text',
      html2canvas: {
        scale: 0.25 // Adjust scale to match PDF units (px to mm approx)
      }
    });
  } catch (e) {
    console.error("PDF Generation Error", e);
  } finally {
    document.body.removeChild(element);
  }
};

export const generateStudentPdf = async (santri: any, settings: DocumentSettings = {}) => {
  const doc = new jsPDF({
    orientation: settings.orientation || 'portrait',
    unit: 'mm',
    format: settings.paperSize || 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const marginTop = settings.marginTop || 10;
  const marginLeft = settings.marginLeft || 15;
  const marginRight = settings.marginRight || 15;
  
  let currentY = marginTop;

  // 1. KOP SURAT
  if (settings.showKopSurat) {
    if (settings.kopSuratImage) {
      try {
        const headerImgData = await getDataUrl(settings.kopSuratImage);
        const imgProps = doc.getImageProperties(headerImgData);
        const headerHeight = settings.kopSuratHeight || 30;
        const headerWidth = (imgProps.width * headerHeight) / imgProps.height;
        
        // Center the image or stretch? Usually full width header or centered logo.
        // Assuming full width header if wide, or logo if small. 
        // Let's just fit it to page width minus margins if it's wide, otherwise center.
        
        // Strategy: Use the full width of the page for the header image
        doc.addImage(headerImgData, 'JPEG', 0, 0, pageWidth, headerHeight);
        currentY = headerHeight + 5;
      } catch (e) {
        console.error("Failed to load kop surat image", e);
        // Fallback to text header
        addTextHeader(doc, pageWidth, marginTop);
        currentY = 45;
      }
    } else {
      addTextHeader(doc, pageWidth, marginTop);
      currentY = 45;
    }
  } else {
    currentY = marginTop;
  }

  // 2. WATERMARK
  if (settings.watermarkText) {
    // This is tricky in jsPDF without advanced plugins, but we can try adding light text
    // We'll add it to every page later
  }

  // 3. TITLE
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BIODATA SANTRI', pageWidth / 2, currentY, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY + 2, pageWidth - marginRight, currentY + 2);
  currentY += 10;

  // 4. DATA SECTIONS
  const addSection = (title: string, data: string[][]) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, marginLeft, currentY);
    currentY += 2;
    
    autoTable(doc, {
      startY: currentY,
      body: data,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1.5 },
      columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
      margin: { left: marginLeft, right: marginRight },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 8;
  };

  addSection('A. DATA PRIBADI', [
    ['Nama Lengkap', `: ${santri.namaLengkap}`],
    ['Nama Panggilan', `: ${santri.namaPanggilan || '-'}`],
    ['NISN', `: ${santri.nisn || '-'}`],
    ['Tempat, Tanggal Lahir', `: ${santri.tempatLahir}, ${formatDate(santri.tanggalLahir)}`],
    ['Jenis Kelamin', `: ${santri.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}`],
    ['Agama', `: ${santri.agama}`],
    ['Kewarganegaraan', `: ${santri.kewarganegaraan}`],
    ['Anak Ke', `: ${santri.anakKe || '-'}`],
    ['Jumlah Saudara', `: ${santri.jumlahSaudara || '-'}`],
    ['Golongan Darah', `: ${santri.golonganDarah || '-'}`],
    ['Alamat', `: ${santri.alamat}`],
    ['No. HP', `: ${santri.noHp || '-'}`],
    ['Email', `: ${santri.email || '-'}`],
  ]);

  // Check page break
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = marginTop;
  }

  addSection('B. DATA KELUARGA', [
    ['Nama Ayah', `: ${santri.namaAyah}`],
    ['NIK Ayah', `: ${santri.nikAyah || '-'}`],
    ['Pekerjaan Ayah', `: ${santri.pekerjaanAyah || '-'}`],
    ['No. HP Ayah', `: ${santri.noHpAyah || '-'}`],
    ['Nama Ibu', `: ${santri.namaIbu}`],
    ['NIK Ibu', `: ${santri.nikIbu || '-'}`],
    ['Pekerjaan Ibu', `: ${santri.pekerjaanIbu || '-'}`],
    ['No. HP Ibu', `: ${santri.noHpIbu || '-'}`],
  ]);

  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = marginTop;
  }

  addSection('C. DATA SEKOLAH ASAL', [
    ['Asal Sekolah', `: ${santri.asalSekolah}`],
    ['NPSN', `: ${santri.npsnSekolah || '-'}`],
    ['Kelas Terakhir', `: ${santri.kelasTerakhir || '-'}`],
    ['Tahun Lulus', `: ${santri.tahunLulus || '-'}`],
    ['No. Ijazah', `: ${santri.noIjazah || '-'}`],
  ]);

  // 5. SIGNATURE
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = marginTop;
  } else {
    currentY += 10;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const signatureX = pageWidth - marginRight - 50;
  doc.text(`Garut, ${dateStr}`, signatureX + 25, currentY, { align: 'center' });
  doc.text('Panitia PSB', signatureX + 25, currentY + 5, { align: 'center' });
  doc.text('(____________________)', signatureX + 25, currentY + 25, { align: 'center' });

  // 6. ATTACHMENTS (New Pages)
  const attachments = [
    { label: 'Foto Santri', url: santri.fotoSantri },
    { label: 'KTP Orang Tua', url: santri.fotoKtp },
    { label: 'Akta Kelahiran', url: santri.fotoAkta },
    { label: 'Ijazah Terakhir', url: santri.fotoIjazah },
    { label: 'Kartu Keluarga', url: santri.fotoKk },
    { label: 'Surat Keterangan Sehat', url: santri.suratSehat },
  ].filter(item => item.url);

  if (attachments.length > 0) {
    doc.addPage();
    let attachY = marginTop;
    
    // Add header again if needed
    if (settings.showKopSurat && settings.kopSuratImage) {
        // Simple re-add logic or skip for attachments
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LAMPIRAN DOKUMEN', pageWidth / 2, attachY, { align: 'center' });
    attachY += 10;

    for (const attach of attachments) {
        try {
            doc.setFontSize(12);
            doc.text(attach.label, marginLeft, attachY);
            attachY += 5;
            
            const imgData = await getDataUrl(attach.url);
            const imgProps = doc.getImageProperties(imgData);
            
            // Calculate dimensions to fit within margins
            const maxWidth = pageWidth - marginLeft - marginRight;
            const maxHeight = pageHeight - attachY - marginBottom - 20; // Leave some space
            
            let w = imgProps.width;
            let h = imgProps.height;
            
            // Scale down if needed
            const ratio = Math.min(maxWidth / w, maxHeight / h);
            w = w * ratio;
            h = h * ratio;
            
            // If image is too tall for remaining space, add new page
            if (h > (pageHeight - attachY - marginBottom)) {
                doc.addPage();
                attachY = marginTop;
                doc.text(attach.label + " (Lanjutan)", marginLeft, attachY);
                attachY += 5;
            }

            doc.addImage(imgData, 'JPEG', marginLeft, attachY, w, h);
            attachY += h + 10;

            // If we are near bottom, add page for next item
            if (attachY > pageHeight - 50) {
                doc.addPage();
                attachY = marginTop;
            }
        } catch (e) {
            console.error(`Failed to add attachment ${attach.label}`, e);
            doc.text(`[Gagal memuat gambar: ${attach.label}]`, marginLeft, attachY);
            attachY += 10;
        }
    }
  }
  
  // Add Watermark to all pages if configured
  if (settings.watermarkText) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(40);
      // Rotate text
      // jsPDF doesn't support rotation easily in text() without advanced usage or context save/restore
      // But we can try centered light text
      doc.text(settings.watermarkText, pageWidth/2, pageHeight/2, { 
          align: 'center',
          angle: 45
      });
      doc.setTextColor(0, 0, 0); // Reset
    }
  }

  doc.save(`Biodata_${santri.namaLengkap.replace(/\s+/g, '_')}.pdf`);
};

export const generateReceiptPdf = async (payment: any, santri: any, settings: DocumentSettings = {}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5', // Receipt usually small
  });
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const marginTop = 10;
  
  // Add Header/Logo
  if (settings.showKopSurat && settings.kopSuratImage) {
      try {
          const headerImgData = await getDataUrl(settings.kopSuratImage);
          doc.addImage(headerImgData, 'JPEG', 0, 0, pageWidth, 25);
      } catch (e) {
          // Fallback
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('KUITANSI PEMBAYARAN', pageWidth / 2, 20, { align: 'center' });
      }
  } else {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('KUITANSI PEMBAYARAN', pageWidth / 2, 20, { align: 'center' });
  }

  let y = 35;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const leftX = 20;
  const valueX = 60;
  
  doc.text('No. Transaksi', leftX, y);
  doc.text(`: ${payment.id}`, valueX, y);
  y += 7;
  
  doc.text('Telah terima dari', leftX, y);
  doc.text(`: ${santri.namaLengkap}`, valueX, y);
  y += 7;
  
  doc.text('Untuk Pembayaran', leftX, y);
  doc.text(`: ${payment.jenisPembayaran || 'Biaya Pendaftaran'}`, valueX, y);
  y += 7;
  
  doc.text('Jumlah', leftX, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`: Rp ${parseInt(payment.jumlah).toLocaleString('id-ID')}`, valueX, y);
  doc.setFont('helvetica', 'normal');
  y += 7;
  
  doc.text('Terbilang', leftX, y);
  doc.setFont('helvetica', 'italic');
  // Need a number to words function for "Terbilang", skipping for now or simple implementation
  doc.text(`: ${payment.jumlah} Rupiah`, valueX, y); 
  doc.setFont('helvetica', 'normal');
  y += 15;
  
  doc.text('Status', leftX, y);
  doc.text(`: ${payment.status.toUpperCase()}`, valueX, y);
  
  // Signature
  const signatureX = pageWidth - 60;
  const dateStr = new Date(payment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  doc.text(`Garut, ${dateStr}`, signatureX, y);
  y += 5;
  doc.text('Bendahara', signatureX, y);
  y += 20;
  doc.text('(________________)', signatureX, y);

  doc.save(`Kuitansi_${payment.id}.pdf`);
};

function addTextHeader(doc: jsPDF, pageWidth: number, startY: number) {
    doc.setFillColor(220, 220, 220);
    doc.circle(25, 25, 12, 'F');
    doc.setFontSize(10);
    doc.text("LOGO", 25, 25, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PONDOK PESANTREN AL-HIDAYAH', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Raya Pesantren No. 123, Desa Sukamaju, Kec. Cilawu', pageWidth / 2, 26, { align: 'center' });
    doc.text('Kab. Garut, Jawa Barat - 44181 | Telp: (0262) 123456', pageWidth / 2, 31, { align: 'center' });
    doc.text('Email: info@ponpes-alhidayah.sch.id | Website: www.ponpes-alhidayah.sch.id', pageWidth / 2, 36, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(15, 42, pageWidth - 15, 42);
    doc.setLineWidth(0.1);
    doc.line(15, 43, pageWidth - 15, 43);
}
