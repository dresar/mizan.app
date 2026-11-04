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
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get("gender");
    const className = searchParams.get("class");

    let sql = `
      SELECT 
        id, nis, name, gender, class, asrama, kamar, 
        base_score as "baseScore", current_score as "currentScore", status, avatar,
        wali_name as "waliName", wali_phone as "waliPhone",
        COALESCE(total_hadir, 28) as "totalHadir",
        COALESCE(total_alpa, 0) as "totalAlpa"
      FROM santri
      WHERE 1=1
    `;
    const params: any[] = [];

    if (gender && gender !== "ALL") {
      params.push(gender);
      sql += ` AND gender = $${params.length}`;
    }

    if (className && className !== "ALL") {
      params.push(className);
      sql += ` AND class = $${params.length}`;
    }

    sql += ` ORDER BY name ASC`;

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, santri: rows });
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

    const body = await req.json();

    if (Array.isArray(body)) {
      let insertedCount = 0;
      for (const item of body) {
        if (!item.name || !item.nis) continue;
        const id = item.id || `santri-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const nis = String(item.nis).trim();
        const name = String(item.name).trim();
        const gender = item.gender === "Putri" ? "Putri" : "Putra";
        const cls = item.class || (gender === "Putra" ? "1A" : "1C");
        const asrama = item.asrama || (gender === "Putra" ? "Asrama Salman Al-Farisi" : "Asrama Khadijah");
        const kamar = item.kamar || "Kamar 01";
        const baseScore = parseFloat(item.baseScore) || 70.0;
        const currentScore = parseFloat(item.currentScore) || baseScore;
        const status = item.status || "Baik";
        const avatar = item.avatar || name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
        const waliName = item.waliName || "";
        const waliPhone = item.waliPhone || "";

        await query(`
          INSERT INTO santri (
            id, nis, name, gender, class, asrama, kamar,
            base_score, current_score, status, avatar,
            wali_name, wali_phone, total_hadir, total_alpa
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 28, 0)
          ON CONFLICT (id) DO UPDATE SET
            nis = EXCLUDED.nis,
            name = EXCLUDED.name,
            gender = EXCLUDED.gender,
            class = EXCLUDED.class,
            wali_name = EXCLUDED.wali_name,
            wali_phone = EXCLUDED.wali_phone
        `, [id, nis, name, gender, cls, asrama, kamar, baseScore, currentScore, status, avatar, waliName, waliPhone]);

        insertedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `${insertedCount} data santri berhasil diimpor.`
      });
    }

    const {
      nis,
      name,
      gender = "Putra",
      class: className = "1A",
      asrama = "Asrama Salman Al-Farisi",
      kamar = "Kamar 01",
      baseScore = 70.0,
      waliName = "",
      waliPhone = ""
    } = body;

    if (!nis || !name) {
      return NextResponse.json(
        { success: false, message: "NIS dan nama santri wajib diisi." },
        { status: 400 }
      );
    }

    const id = `santri-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const avatar = name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();

    await query(`
      INSERT INTO santri (
        id, nis, name, gender, class, asrama, kamar,
        base_score, current_score, status, avatar,
        wali_name, wali_phone, total_hadir, total_alpa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Baik', $10, $11, $12, 28, 0)
    `, [
      id,
      String(nis).trim(),
      String(name).trim(),
      gender,
      className,
      asrama,
      kamar,
      baseScore,
      baseScore,
      avatar,
      waliName,
      waliPhone
    ]);

    return NextResponse.json({
      success: true,
      message: `Santri ${name} berhasil ditambahkan.`
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

    const { id, nis, name, gender, class: className, baseScore, waliName, waliPhone, status } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID santri wajib disertakan." },
        { status: 400 }
      );
    }

    await query(`
      UPDATE santri
      SET 
        nis = COALESCE($2, nis),
        name = COALESCE($3, name),
        gender = COALESCE($4, gender),
        class = COALESCE($5, class),
        base_score = COALESCE($6, base_score),
        wali_name = COALESCE($7, wali_name),
        wali_phone = COALESCE($8, wali_phone),
        status = COALESCE($9, status)
      WHERE id = $1
    `, [id, nis, name, gender, className, baseScore, waliName, waliPhone, status]);

    return NextResponse.json({
      success: true,
      message: "Data santri berhasil diperbarui."
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
        { success: false, message: "ID santri wajib disertakan." },
        { status: 400 }
      );
    }

    await query(`DELETE FROM penilaian WHERE santri_id = ANY($1::text[])`, [targetIds]);
    await query(`DELETE FROM absensi WHERE santri_id = ANY($1::text[])`, [targetIds]);
    await query(`DELETE FROM santri WHERE id = ANY($1::text[])`, [targetIds]);

    return NextResponse.json({
      success: true,
      message: `${targetIds.length} data santri berhasil dihapus.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
