import { z } from 'zod';

export type AIGenerateType = 
  | 'blog' 
  | 'vision_mission' 
  | 'program_description' 
  | 'announcement' 
  | 'educational_content' 
  | 'activity_report' 
  | 'islamic_quote' 
  | 'biography' 
  | 'pesantren_activity' 
  | 'social_media' 
  | 'curriculum' 
  | 'faq' 
  | 'profile' 
  | 'facility_description' 
  | 'event_content' 
  | 'islamic_article'
  | 'schedule_entry';

interface AIGenerateOptions {
  type: AIGenerateType;
  prompt: string;
  context?: string;
  tone?: 'formal' | 'casual' | 'inspirational' | 'academic';
  length?: 'short' | 'medium' | 'long';
}

const SYSTEM_PROMPTS: Record<AIGenerateType, string> = {
  blog: "Anda adalah penulis blog profesional untuk pesantren. Tulis artikel blog lengkap, informatif, dan menarik. Gunakan bahasa Indonesia yang baik dan benar. Struktur artikel harus jelas dengan pendahuluan, isi (beberapa poin), dan kesimpulan. Sertakan referensi Al-Quran atau Hadits yang relevan. Output harus bersih tanpa markdown, asterisk (*), atau simbol formatting lainnya. Minimal 1000 kata jika diminta panjang.",
  vision_mission: "Buatkan Visi dan Misi lembaga pendidikan Islam/Pesantren yang inspiratif, visioner, dan berlandaskan nilai-nilai Islam. Format: Visi (1 paragraf), Misi (poin-poin). Output bersih tanpa simbol aneh.",
  program_description: "Tuliskan deskripsi program pendidikan pesantren yang menarik minat calon santri dan orang tua. Jelaskan keunggulan, tujuan, dan output program. Bahasa persuasif dan islami.",
  announcement: "Buat pengumuman resmi pesantren yang formal, jelas, dan sopan. Gunakan salam islami. Struktur: Salam, Isi Pengumuman, Detail (Waktu/Tempat), Penutup. Output bersih.",
  educational_content: "Buat konten edukatif islami yang mudah dipahami. Fokus pada nilai-nilai moral dan akhlak. Sertakan dalil naqli.",
  activity_report: "Tulis laporan kegiatan pesantren secara naratif. Jelaskan latar belakang, pelaksanaan, dan hasil kegiatan. Nada formal dan objektif.",
  schedule_entry: "Anda adalah asisten penyusun jadwal pesantren. Berikan deskripsi singkat (1-2 kalimat) yang inspiratif dan jelas untuk kegiatan harian santri. Output harus langsung berupa deskripsi tanpa pembuka/penutup.",
  islamic_quote: "Buatkan kumpulan kata-kata mutiara atau do'a islami yang menyejukkan hati, bersumber dari Al-Quran, Hadits, atau perkataan Ulama. Sertakan terjemahannya.",
  biography: "Tuliskan biografi singkat Ustaz/Ustazah atau tokoh ulama. Fokus pada latar belakang pendidikan, kiprah dakwah, dan karya/jasa beliau.",
  pesantren_activity: "Deskripsikan kegiatan harian atau mingguan santri di pesantren dengan gaya bercerita yang menarik dan menggambarkan suasana religius.",
  social_media: "Buat caption media sosial (Instagram/Facebook) yang engaging, islami, dan relevan dengan topik pesantren. Sertakan hashtag yang relevan.",
  curriculum: "Susun deskripsi kurikulum program pendidikan. Jelaskan mata pelajaran inti, metode pembelajaran, dan target capaian santri.",
  faq: "Buatkan daftar pertanyaan yang sering diajukan (FAQ) beserta jawabannya untuk calon wali santri. Bahasa ramah dan informatif.",
  profile: "Tulis profil lembaga pesantren secara komprehensif. Sejarah singkat, filosofi pendidikan, dan keunggulan lembaga.",
  facility_description: "Deskripsikan fasilitas pesantren dengan detail yang menonjolkan kenyamanan, kebersihan, dan fungsinya untuk mendukung pembelajaran.",
  event_content: "Buat konten promosi atau deskripsi untuk acara/event pesantren (misal: Kajian Akbar, Wisuda). Bahasa mengundang dan antusias.",
  islamic_article: "Tulis artikel keislaman mendalam tentang topik tertentu (fiqih/aqidah/akhlak). Gunakan referensi kitab mu'tabar jika memungkinkan. Nada akademis namun mudah dipahami."
};

export const aiService = {
  async generateContent(options: AIGenerateOptions, config?: { apiKey?: string, apiUrl?: string }): Promise<string> {
    const AI_API_KEY = config?.apiKey || import.meta.env.VITE_AI_API_KEY;
    const AI_API_URL = config?.apiUrl || import.meta.env.VITE_AI_API_URL;

    if (!AI_API_KEY || !AI_API_URL) {
      throw new Error("Konfigurasi AI belum lengkap. Hubungi administrator.");
    }

    const systemPrompt = SYSTEM_PROMPTS[options.type] || "Anda adalah asisten AI islami yang membantu operasional pesantren.";
    
    // Construct the user prompt with additional constraints
    let userPrompt = `Topik/Instruksi: ${options.prompt}.`;
    if (options.context) userPrompt += `\nKonteks Tambahan: ${options.context}`;
    userPrompt += `\n\nInstruksi Teknis:
    1. Gunakan Bahasa Indonesia yang baku dan sopan.
    2. Nada tulisan: ${options.tone || 'formal'}.
    3. Panjang tulisan: ${options.length || 'medium'}.
    4. PENTING: Jangan gunakan format Markdown (seperti **bold**, # heading, - list). Gunakan format teks biasa dengan paragraf yang rapi. Gunakan angka 1. 2. 3. untuk list.
    5. Pastikan konten sesuai nilai-nilai Islam Ahlussunnah wal Jamaah.
    6. Hindari konten kontroversial atau memecah belah.`;

    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_AI_MODEL || "gemini-2.5-flash", 
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: options.length === 'long' ? 2000 : options.length === 'short' ? 300 : 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI Service Error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";

      // Post-processing to clean up any leaked markdown
      content = content.replace(/\*\*/g, "").replace(/##/g, "").replace(/`/g, "");

      return content.trim();
    } catch (error) {
      console.error("AI Generation Failed:", error);
      throw error;
    }
  }
};
