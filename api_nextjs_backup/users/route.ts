import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyRequestAuth } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const auth = verifyRequestAuth(req, "SUPER_ADMIN");
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Akses ditolak: Memerlukan hak akses Super Admin." },
        { status: 403 }
      );
    }

    const rows = await query(`
      SELECT 
        id, username, name, role, role_title as "roleTitle", 
        avatar_initials as "avatarInitials", avatar_url as "avatarUrl", 
        gender, assigned_class as "assignedClass", is_active as "isActive",
        created_at as "createdAt"
      FROM users 
      WHERE is_active = true
      ORDER BY role ASC, name ASC
    `);

    return NextResponse.json({ success: true, users: rows });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = verifyRequestAuth(req, "SUPER_ADMIN");
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Akses ditolak: Memerlukan hak akses Super Admin." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { username, password, name, role, roleTitle, gender, assignedClass } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Username, password, dan nama wajib diisi." },
        { status: 400 }
      );
    }

    const check = await query(`SELECT id FROM users WHERE LOWER(username) = LOWER($1)`, [username.trim()]);
    if (check.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username sudah terdaftar. Gunakan username lain." },
        { status: 400 }
      );
    }

    const id = "user-" + Date.now();
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n: string) => n[0].toUpperCase())
      .join("") || "US";

    await query(`
      INSERT INTO users (
        id, username, password, name, role, role_title, 
        avatar_initials, gender, assigned_class, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
    `, [
      id,
      username.trim().toLowerCase(),
      password,
      name.trim(),
      role || "GURU",
      roleTitle || (role === "SUPER_ADMIN" ? "Super Admin Pengasuhan" : gender === "Putri" ? "Pembina Santriwati Putri" : "Pembina Santri Putra"),
      initials,
      gender || "Putra",
      assignedClass || "1A"
    ]);

    if (role === "GURU") {
      await query(`
        INSERT INTO guru_monitoring (
          id, name, gender, assigned_class, status, report_count_today, last_login
        ) VALUES ($1, $2, $3, $4, 'Belum Lapor', 0, 'Baru Dibuat')
        ON CONFLICT (id) DO NOTHING
      `, ["guru-" + id, name.trim(), gender || "Putra", assignedClass || "1A"]);
    }

    return NextResponse.json({
      success: true,
      message: "Akun pengguna berhasil dibuat."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = verifyRequestAuth(req, "SUPER_ADMIN");
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Akses ditolak: Memerlukan hak akses Super Admin." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, password, role, roleTitle, gender, assignedClass, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID diperlukan." },
        { status: 400 }
      );
    }

    if (password && password.trim().length > 0) {
      await query(`UPDATE users SET password = $1 WHERE id = $2`, [password, id]);
    }

    await query(`
      UPDATE users SET
        name = COALESCE($1, name),
        role = COALESCE($2, role),
        role_title = COALESCE($3, role_title),
        gender = COALESCE($4, gender),
        assigned_class = COALESCE($5, assigned_class),
        is_active = COALESCE($6, is_active)
      WHERE id = $7
    `, [name, role, roleTitle, gender, assignedClass, isActive, id]);

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = verifyRequestAuth(req, "SUPER_ADMIN");
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Akses ditolak: Memerlukan hak akses Super Admin." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");
    let targetIds: string[] = [];
    if (idsParam) {
      targetIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (id) {
      targetIds = [id.trim()];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body?.ids)) {
          targetIds = body.ids.filter(Boolean);
        }
      } catch {
        void 0;
      }
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "User ID diperlukan." },
        { status: 400 }
      );
    }

    await query(`DELETE FROM users WHERE id = ANY($1::text[])`, [targetIds]);

    return NextResponse.json({
      success: true,
      message: `${targetIds.length} pengguna berhasil dihapus.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
