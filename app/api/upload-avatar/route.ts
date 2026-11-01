import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || "";

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

    let ext = ".jpg";
    if (mime.includes("png")) ext = ".png";
    else if (mime.includes("webp")) ext = ".webp";
    else if (mime.includes("gif")) ext = ".gif";

    const cleanUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "") || "user";
    const filename = `avatar-${cleanUserId}-${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/avatars/${filename}`;

    if (userId) {
      await query(
        `UPDATE users SET avatar_url = $1 WHERE id = $2`,
        [relativeUrl, userId]
      );
    }

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
