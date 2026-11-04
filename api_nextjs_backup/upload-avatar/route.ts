import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { query } from "@/lib/db";
import { verifyRequestAuth } from "@/lib/auth-server";

function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) return true;
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) return true;
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) return true;
  return false;
}

export async function POST(req: Request) {
  try {
    const auth = verifyRequestAuth(req);
    if (!auth.authorized || !auth.session) {
      return NextResponse.json(
        { success: false, message: auth.message || "Autentikasi diperlukan." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || auth.session.userId;

    const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "") || "user";
    if (auth.session.role !== "SUPER_ADMIN" && auth.session.userId !== cleanUserId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Anda tidak dapat mengubah foto pengguna lain." },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    const mime = file.type;
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(mime)) {
      return NextResponse.json(
        { success: false, message: "Format file harus JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran file maksimal 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidImageMagicBytes(buffer)) {
      return NextResponse.json(
        { success: false, message: "File yang diunggah bukan format gambar yang valid." },
        { status: 400 }
      );
    }

    let ext = ".jpg";
    if (mime.includes("png")) ext = ".png";
    else if (mime.includes("webp")) ext = ".webp";
    else if (mime.includes("gif")) ext = ".gif";

    const filename = `avatar-${cleanUserId}-${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/avatars/${filename}`;

    await query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2`,
      [relativeUrl, cleanUserId]
    );

    return NextResponse.json({
      success: true,
      avatarUrl: relativeUrl,
      message: "Foto profil berhasil disimpan."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengunggah foto." },
      { status: 500 }
    );
  }
}
