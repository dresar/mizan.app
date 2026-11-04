import { NextResponse } from "next/server";
import { AIAnalysisResult } from "@/lib/mock-data";
import { formatWIBDateTime } from "@/lib/date-utils";
import { verifyRequestAuth } from "@/lib/auth-server";

interface AnalyzePayload {
  title: string;
  description: string;
  category: string;
  pageUrl?: string;
  userRole?: string;
}

const SUMOPOD_KEY = process.env.SUMOPOD_API_KEY || "";
const SUMOPOD_URL = "https://ai.sumopod.com/v1/chat/completions";

const BYNARA_KEY = process.env.BYNARA_API_KEY || "";
const BYNARA_URL = "https://router.bynara.id/v1/chat/completions";

function getRelevantModuleContext(category: string): string {
  const lowerCat = category.toLowerCase();
  if (lowerCat.includes("absen")) {
    return "Modul Presensi Sholat 7 Waktu: mencatat kehadiran Subuh, Dzuhur, Ashar, Maghrib, Isya, Dhuha, Tahajjud santri.";
  }
  if (lowerCat.includes("rapor") || lowerCat.includes("pdf")) {
    return "Modul Rapor & PDF: rekap skor adab santri, kedisiplinan, dan grafik kehadiran.";
  }
  if (lowerCat.includes("nilai") || lowerCat.includes("penilaian")) {
    return "Modul Penilaian: pencatatan sikap hasanah/sayyiah, kategori pelanggaran dan unsur poin.";
  }
  if (lowerCat.includes("login") || lowerCat.includes("auth")) {
    return "Modul Autentikasi: verifikasi sesi pengguna multi-role.";
  }
  return "Modul Operasional Mizan Apps.";
}

function generateFallbackAnalysis(payload: AnalyzePayload): AIAnalysisResult {
  const { title, description, category, pageUrl } = payload;
  const lowerDesc = `${title} ${description} ${category}`.toLowerCase();

  let affectedFiles: string[] = ["lib/mizan-context.tsx"];
  let severity: "Kritis" | "Tinggi" | "Sedang" | "Rendah" = "Sedang";
  let rootCause = "Potensi inkonsistensi state client-side atau sinkronisasi data async pada siklus render React 19.";

  if (lowerDesc.includes("sholat") || lowerDesc.includes("absen")) {
    affectedFiles = ["app/guru/absen/page.tsx", "app/api/absensi/route.ts", "lib/db.ts"];
    severity = "Tinggi";
    rootCause = "Ketidaksesuaian payload status presensi dengan format enum database atau timeout koneksi pg pool pada jam sibuk sholat.";
  } else if (lowerDesc.includes("pdf") || lowerDesc.includes("rapor") || lowerDesc.includes("cetak")) {
    affectedFiles = ["lib/pdf-generator.ts", "app/admin/rapor/page.tsx", "app/ortu/dashboard/page.tsx"];
    severity = "Sedang";
    rootCause = "Resolusi elemen kanvas html2canvas melebihi kapasitas memori browser mobile atau font kustom jspdf gagal dimuat.";
  } else if (lowerDesc.includes("login") || lowerDesc.includes("sandi") || lowerDesc.includes("role") || lowerDesc.includes("sesi")) {
    affectedFiles = ["middleware.ts", "app/login/page.tsx", "lib/auth-server.ts"];
    severity = "Kritis";
    rootCause = "Verifikasi HMAC SHA-256 session token gagal atau masa berlaku cookie mizan_session kadaluarsa sebelum sinkronisasi context selesai.";
  } else if (lowerDesc.includes("nilai") || lowerDesc.includes("skor") || lowerDesc.includes("hasanah") || lowerDesc.includes("sayyiah")) {
    affectedFiles = ["app/guru/input-penilaian/page.tsx", "app/api/penilaian/route.ts", "lib/mock-data.ts"];
    severity = "Tinggi";
    rootCause = "Kalkulasi agregasi base_score dan penalti sayyiah belum memicu re-fetch otomatis pada komponen penampil.";
  }

  const promptBuilder = [
    `### PERBAIKAN BUG MIZAN APPS: ${title}`,
    `- Modul Terdampak: ${category} (${pageUrl || "Umum"})`,
    `- Tingkat Keparahan: ${severity}`,
    `- Berkas Terkait: ${affectedFiles.join(", ")}`,
    ``,
    `#### Identifikasi Masalah:`,
    `${description}`,
    ``,
    `#### Analisis Akar Masalah:`,
    `${rootCause}`,
    ``,
    `#### Instruksi Perbaikan Kode:`,
    `1. Buka dan teliti berkas ${affectedFiles[0]}.`,
    `2. Perbaiki penanganan error dengan fallback terstruktur dan validasi payload sebelum mutasi.`,
    `3. Pastikan waktu dicatat dalam zona WIB (Asia/Jakarta) menggunakan date-utils.ts.`,
    `4. Patuhi aturan baku proyek: STRICT NOKOMEN (dilarang ada komentar kode) dan tombol aksi 1 kata tunggal.`,
    `5. Lakukan verifikasi build lokal: npm run build.`
  ].join("\n");

  return {
    summary: `Analisis bug pada modul ${category}: ${title}`,
    rootCause,
    affectedFiles,
    severity,
    recommendationPrompt: promptBuilder,
    generatedAt: formatWIBDateTime(new Date())
  };
}

export async function POST(req: Request) {
  try {
    const auth = verifyRequestAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: "Autentikasi diperlukan." }, { status: 401 });
    }

    const payload: AnalyzePayload = await req.json();
    if (!payload.title && !payload.description) {
      return NextResponse.json({ success: false, message: "Informasi laporan belum lengkap" }, { status: 400 });
    }

    const moduleContext = getRelevantModuleContext(payload.category || "");

    const systemPrompt = `Anda adalah Master Architect & AI Code Inspector khusus Mizan Apps.
Tugas Anda adalah membaca dan menganalisis laporan bug dari pengguna secara objektif.

KONTEKS MODUL:
${moduleContext}

ATURAN BAKU:
1. Analisis harus objektif, teknis, dan mengidentifikasi modul serta penanganan masalah secara spesifik.
2. Buat Prompting Teknis Perbaikan Kode yang profesional, siap diberikan kepada tim engineer.
3. Wajib mematuhi aturan Mizan: NOKOMEN (tanpa komentar di dalam kode saran) dan tombol aksi 1 kata.
4. Format output HARUS berupa JSON valid tanpa markdown luar:
{
  "summary": "Ringkasan temuan bug dalam 1-2 kalimat",
  "rootCause": "Penjelasan mendalam akar masalah pada arsitektur kode",
  "affectedFiles": ["path/file1.ts", "path/file2.tsx"],
  "severity": "Kritis" | "Tinggi" | "Sedang" | "Rendah",
  "recommendationPrompt": "Prompt teknis perbaikan yang lengkap dan detail siap pakai"
}`;

    const userMessage = `Kategori: ${payload.category || "Umum"}
Halaman: ${payload.pageUrl || "/"}
Role Pengguna: ${payload.userRole || "GUEST"}
Judul Bug: ${payload.title}
Deskripsi Masalah: ${payload.description}`;

    let aiResult: AIAnalysisResult | null = null;

    if (SUMOPOD_KEY) {
      try {
        const response = await fetch(SUMOPOD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUMOPOD_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-v4.1-flash:netra",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.2
        }),
        signal: AbortSignal.timeout(9000)
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || "";
        const cleanJsonStr = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJsonStr);
        if (parsed.summary && parsed.rootCause && parsed.recommendationPrompt) {
          aiResult = {
            summary: parsed.summary,
            rootCause: parsed.rootCause,
            affectedFiles: Array.isArray(parsed.affectedFiles) ? parsed.affectedFiles : ["lib/mizan-context.tsx"],
            severity: parsed.severity || "Sedang",
            recommendationPrompt: parsed.recommendationPrompt,
            generatedAt: formatWIBDateTime(new Date())
          };
        }
      }
    } catch {
      void 0;
    }
  }

    if (!aiResult && BYNARA_KEY) {
      try {
        const responseByNara = await fetch(BYNARA_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${BYNARA_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-v4-pro",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
            ],
            temperature: 0.2
          }),
          signal: AbortSignal.timeout(9000)
        });

        if (responseByNara.ok) {
          const data = await responseByNara.json();
          const rawContent = data.choices?.[0]?.message?.content || "";
          const cleanJsonStr = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJsonStr);
          if (parsed.summary && parsed.rootCause && parsed.recommendationPrompt) {
            aiResult = {
              summary: parsed.summary,
              rootCause: parsed.rootCause,
              affectedFiles: Array.isArray(parsed.affectedFiles) ? parsed.affectedFiles : ["lib/mizan-context.tsx"],
              severity: parsed.severity || "Sedang",
              recommendationPrompt: parsed.recommendationPrompt,
              generatedAt: formatWIBDateTime(new Date())
            };
          }
        }
      } catch {
        void 0;
      }
    }

    if (!aiResult) {
      aiResult = generateFallbackAnalysis(payload);
    }

    return NextResponse.json({
      success: true,
      data: aiResult
    });
  } catch (err: any) {
    const fallback = generateFallbackAnalysis({
      title: "Kendala Sistem",
      description: err?.message || "Kesalahan tidak terduga",
      category: "Sistem"
    });
    return NextResponse.json({
      success: true,
      data: fallback
    });
  }
}
