import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        id, santri_id as "santriId", santri_name as "santriName",
        santri_class as "santriClass", gender, guru_id as "guruId",
        guru_name as "guruName", COALESCE(waktu_sholat, 'Subuh') as "waktuSholat",
        date, status, score_impact as "scoreImpact",
        notes, created_at as "createdAt"
      FROM absensi ORDER BY created_at DESC LIMIT 200
    `);

    return NextResponse.json({ success: true, absensi: rows });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { records } = await req.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data absensi kosong." },
        { status: 400 }
      );
    }

    const guruId = records[0].guruId;
    const guruName = records[0].guruName;

    for (const rec of records) {
      const id = "abs-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

      await query(`
        INSERT INTO absensi (
          id, santri_id, santri_name, santri_class, gender,
          guru_id, guru_name, waktu_sholat, date, status, score_impact, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        id,
        rec.santriId,
        rec.santriName,
        rec.santriClass,
        rec.gender,
        rec.guruId,
        rec.guruName,
        rec.waktuSholat || "Subuh",
        rec.date,
        rec.status,
        rec.scoreImpact,
        rec.notes || null
      ]);

      const hadirInc = rec.status === "Hadir" ? 1 : 0;
      const alpaInc = rec.status === "Alpa" ? 1 : 0;

      await query(`
        UPDATE santri
        SET 
          current_score = GREATEST(0, LEAST(99, ROUND(current_score + $1, 3))),
          total_hadir = COALESCE(total_hadir, 28) + $2,
          total_alpa = COALESCE(total_alpa, 0) + $3,
          status = CASE
            WHEN (current_score + $1) < 60 THEN 'Perlu Pembinaan'
            WHEN (current_score + $1) < 75 THEN 'Perhatian'
            ELSE 'Baik'
          END
        WHERE id = $4
      `, [rec.scoreImpact, hadirInc, alpaInc, rec.santriId]);
    }

    if (guruName) {
      await query(`
        UPDATE guru_monitoring
        SET 
          report_count_today = report_count_today + 1,
          status = 'Sudah Lapor',
          last_login = 'Hari ini, ' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') || ' WIB'
        WHERE name = $1 OR id = $2
      `, [guruName, guruId]);
    }

    return NextResponse.json({
      success: true,
      message: `${records.length} data absensi berhasil disimpan.`
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
    const { id, status, notes } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status absensi diperlukan." },
        { status: 400 }
      );
    }

    const currentRows = await query(`
      SELECT id, santri_id, status, score_impact FROM absensi WHERE id = $1
    `, [id]);

    if (currentRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data absensi tidak ditemukan." },
        { status: 404 }
      );
    }

    const oldRecord = currentRows[0];
    const oldImpact = parseFloat(oldRecord.score_impact);

    const settingRows = await query(`SELECT value FROM app_settings WHERE key = 'general' LIMIT 1`);
    const generalSettings = settingRows[0]?.value || {};
    const hadirScore = typeof generalSettings.absenHadirScore === "number" ? generalSettings.absenHadirScore : 0.050;
    const izinScore = typeof generalSettings.absenIzinScore === "number" ? generalSettings.absenIzinScore : 0.000;
    const sakitScore = typeof generalSettings.absenSakitScore === "number" ? generalSettings.absenSakitScore : 0.000;
    const alpaScore = typeof generalSettings.absenAlpaScore === "number" ? generalSettings.absenAlpaScore : -0.050;

    let newImpact = 0.0;
    if (status === "Hadir") newImpact = hadirScore;
    else if (status === "Alpa") newImpact = alpaScore;
    else if (status === "Izin") newImpact = izinScore;
    else if (status === "Sakit") newImpact = sakitScore;

    const delta = newImpact - oldImpact;

    await query(`
      UPDATE absensi
      SET status = $1, score_impact = $2, notes = COALESCE($3, notes)
      WHERE id = $4
    `, [status, newImpact, notes, id]);

    if (delta !== 0) {
      await query(`
        UPDATE santri
        SET 
          current_score = GREATEST(0, LEAST(99, ROUND(current_score + $1, 3))),
          total_hadir = CASE 
            WHEN $2 = 'Hadir' AND $3 != 'Hadir' THEN COALESCE(total_hadir, 28) + 1
            WHEN $2 != 'Hadir' AND $3 = 'Hadir' THEN GREATEST(0, COALESCE(total_hadir, 28) - 1)
            ELSE COALESCE(total_hadir, 28)
          END,
          total_alpa = CASE 
            WHEN $2 = 'Alpa' AND $3 != 'Alpa' THEN COALESCE(total_alpa, 0) + 1
            WHEN $2 != 'Alpa' AND $3 = 'Alpa' THEN GREATEST(0, COALESCE(total_alpa, 0) - 1)
            ELSE COALESCE(total_alpa, 0)
          END
        WHERE id = $4
      `, [delta, status, oldRecord.status, oldRecord.santri_id]);
    }

    return NextResponse.json({
      success: true,
      message: "Status absensi berhasil diperbarui."
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID absensi diperlukan." },
        { status: 400 }
      );
    }

    const rows = await query(`
      SELECT id, santri_id, status, score_impact FROM absensi WHERE id = $1
    `, [id]);

    if (rows.length > 0) {
      const rec = rows[0];
      const impact = parseFloat(rec.score_impact);

      if (impact !== 0) {
        await query(`
          UPDATE santri
          SET current_score = GREATEST(0, LEAST(99, ROUND(current_score - $1, 3)))
          WHERE id = $2
        `, [impact, rec.santri_id]);
      }

      await query(`DELETE FROM absensi WHERE id = $1`, [id]);
    }

    return NextResponse.json({
      success: true,
      message: "Data absensi berhasil dihapus."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
