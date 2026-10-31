import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, newPassword, avatarUrl } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID wajib disertakan." },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.trim().length < 4) {
      return NextResponse.json(
        { success: false, message: "Kata sandi baru minimal 4 karakter." },
        { status: 400 }
      );
    }

    if (newPassword) {
      await query(`UPDATE users SET password = $1 WHERE id = $2`, [newPassword, userId]);
    }

    if (avatarUrl !== undefined) {
      await query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [avatarUrl, userId]);
    }

    return NextResponse.json({
      success: true,
      message: "Profil dan kata sandi berhasil diperbarui."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
