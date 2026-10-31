import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const rows = await query(`
      SELECT 
        id, username, password, name, role, 
        role_title as "roleTitle", avatar_initials as "avatarInitials", 
        avatar_url as "avatarUrl", gender, assigned_class as "assignedClass",
        is_active as "isActive"
      FROM users 
      WHERE LOWER(username) = LOWER($1) AND is_active = true
      LIMIT 1
    `, [username.trim()]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Username tidak ditemukan atau akun dinonaktifkan." },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: "Kata sandi yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    const { password: _, ...userProfile } = user;

    return NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: userProfile
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
