import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyRequestAuth } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const auth = verifyRequestAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Autentikasi diperlukan." },
        { status: 401 }
      );
    }
    const rows = await query(`
      SELECT 
        c.id, c.name, COALESCE(c.gender, 'Putra') as gender,
        COALESCE(c.wali_kelas, '') as "waliKelas",
        COALESCE(c.guru_id, '') as "guruId",
        COUNT(s.id)::int as "studentCount",
        COALESCE(ROUND(AVG(s.current_score), 3), 70.000) as "avgScore"
      FROM classes c
      LEFT JOIN santri s ON UPPER(s.class) = UPPER(c.name)
      GROUP BY c.id, c.name, c.gender, c.wali_kelas, c.guru_id
      ORDER BY c.name ASC
    `);

    const simpleNames = rows.map((r: any) => r.name);

    return NextResponse.json({
      success: true,
      classes: simpleNames,
      classList: rows
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
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

    const { name, gender = "Putra", waliKelas = "", guruId = "" } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama kelas wajib diisi." },
        { status: 400 }
      );
    }

    const className = name.trim().toUpperCase();
    const id = "cls-" + className.toLowerCase();

    await query(`
      INSERT INTO classes (id, name, gender, wali_kelas, guru_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (name) DO UPDATE SET
        gender = EXCLUDED.gender,
        wali_kelas = EXCLUDED.wali_kelas,
        guru_id = EXCLUDED.guru_id
    `, [id, className, gender, waliKelas, guruId]);

    return NextResponse.json({
      success: true,
      message: `Kelas ${className} berhasil ditambahkan.`
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

    const { name, newName, gender, waliKelas, guruId } = await req.json();
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kelas wajib disertakan." },
        { status: 400 }
      );
    }

    const oldName = name.trim().toUpperCase();
    const targetName = (newName && newName.trim().toUpperCase()) || oldName;

    await query(`
      UPDATE classes
      SET 
        name = $1,
        gender = COALESCE($3, gender),
        wali_kelas = COALESCE($4, wali_kelas),
        guru_id = COALESCE($5, guru_id)
      WHERE UPPER(name) = UPPER($2)
    `, [targetName, oldName, gender, waliKelas, guruId]);

    if (targetName !== oldName) {
      await query(`UPDATE santri SET class = $1 WHERE UPPER(class) = UPPER($2)`, [targetName, oldName]);
      await query(`UPDATE users SET assigned_class = $1 WHERE UPPER(assigned_class) = UPPER($2)`, [targetName, oldName]);
      await query(`UPDATE penilaian SET santri_class = $1 WHERE UPPER(santri_class) = UPPER($2)`, [targetName, oldName]);
      await query(`UPDATE absensi SET santri_class = $1 WHERE UPPER(santri_class) = UPPER($2)`, [targetName, oldName]);
    }

    if (guruId) {
      await query(`
        UPDATE users
        SET assigned_class = $1
        WHERE id = $2
      `, [targetName, guruId]);
    }

    return NextResponse.json({
      success: true,
      message: `Data kelas ${targetName} berhasil diperbarui.`
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
    const name = searchParams.get("name");
    const namesParam = searchParams.get("names");
    let targetNames: string[] = [];
    if (namesParam) {
      targetNames = namesParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    } else if (name) {
      targetNames = [name.trim().toUpperCase()];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body?.names)) {
          targetNames = body.names.map((s: string) => String(s).trim().toUpperCase()).filter(Boolean);
        }
      } catch {
        void 0;
      }
    }

    if (targetNames.length === 0) {
      return NextResponse.json(
        { success: false, message: "Nama kelas wajib disertakan." },
        { status: 400 }
      );
    }

    await query(`DELETE FROM classes WHERE UPPER(name) = ANY($1::text[])`, [targetNames]);
    await query(`UPDATE santri SET class = '' WHERE UPPER(class) = ANY($1::text[])`, [targetNames]);
    await query(`UPDATE users SET assigned_class = NULL WHERE UPPER(assigned_class) = ANY($1::text[])`, [targetNames]);

    return NextResponse.json({
      success: true,
      message: `${targetNames.length} kelas berhasil dihapus.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
