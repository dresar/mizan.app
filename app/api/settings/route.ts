import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DEFAULT_SETTINGS, AppSettings } from "@/lib/mock-data";
import { verifyRequestAuth } from "@/lib/auth-server";

export async function GET() {
  try {
    const rows = await query(`
      SELECT value FROM app_settings WHERE key = 'general' LIMIT 1
    `);

    const current: AppSettings = rows.length > 0
      ? { ...DEFAULT_SETTINGS, ...rows[0].value }
      : DEFAULT_SETTINGS;

    return NextResponse.json({
      success: true,
      settings: current
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
        { success: false, message: auth.message || "Akses ditolak: Hanya Super Admin yang berwenang mengubah pengaturan nilai." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      settings,
      applyToSantri = false,
      applyToIndicators = false
    } = body;

    const mergedSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...(settings || body)
    };

    await query(`
      INSERT INTO app_settings (key, value)
      VALUES ('general', $1::jsonb)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value
    `, [JSON.stringify(mergedSettings)]);

    if (applyToSantri) {
      const base = mergedSettings.defaultBaseScore ?? 70.0;
      const lisanMin = mergedSettings.lisanMin ?? 51.0;
      const sp1Min = mergedSettings.sp1Min ?? 36.0;
      const sp2Min = mergedSettings.sp2Min ?? 21.0;
      const sp3Min = mergedSettings.sp3Min ?? 6.0;

      await query(`
        UPDATE santri
        SET
          base_score = $1,
          status = CASE
            WHEN current_score >= $1 THEN 'Aman'
            WHEN current_score >= $2 THEN 'Peringatan Lisan'
            WHEN current_score >= $3 THEN 'SP 1'
            WHEN current_score >= $4 THEN 'SP 2'
            WHEN current_score >= $5 THEN 'SP 3'
            ELSE 'Pengembalian'
          END
      `, [base, lisanMin, sp1Min, sp2Min, sp3Min]);
    }

    if (applyToIndicators) {
      await query(`
        UPDATE indicators SET default_score = $1 WHERE type = 'HASANAH' AND tingkat = 'Ringan'
      `, [mergedSettings.bonusRingan]);

      await query(`
        UPDATE indicators SET default_score = $1 WHERE type = 'HASANAH' AND tingkat = 'Sedang'
      `, [mergedSettings.bonusSedang]);

      await query(`
        UPDATE indicators SET default_score = $1 WHERE type = 'HASANAH' AND tingkat = 'Berat'
      `, [mergedSettings.bonusBesar]);

      await query(`
        UPDATE indicators SET default_score = $1 WHERE type = 'SAYYIAH' AND tingkat = 'Ringan'
      `, [mergedSettings.penaltyRingan]);

      await query(`
        UPDATE indicators SET default_score = $1 WHERE type = 'SAYYIAH' AND tingkat = 'Sedang'
      `, [mergedSettings.penaltySedang]);

      await query(`
        UPDATE indicators SET default_score = $1 WHERE type = 'SAYYIAH' AND tingkat = 'Berat'
      `, [mergedSettings.penaltyBerat]);
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan berhasil disimpan.",
      settings: mergedSettings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
