import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyRequestAuth } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const auth = verifyRequestAuth(request, "SUPER_ADMIN");
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Akses ditolak: Hanya Super Admin yang berwenang mengunduh cadangan data." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "1";
    const scope = searchParams.get("scope") || "all";

    const santriRows = await query(`
      SELECT 
        id, nis, name, gender, class, asrama, kamar,
        base_score, current_score, status, avatar,
        wali_name, wali_phone, total_hadir, total_alpa
      FROM santri 
      ORDER BY class ASC, name ASC
    `);

    const classRows = await query(`
      SELECT id, name, gender, wali_kelas, guru_id
      FROM classes 
      ORDER BY name ASC
    `);

    const userRows = await query(`
      SELECT 
        id, username, name, role, role_title, avatar_initials,
        avatar_url, gender, assigned_class, is_active
      FROM users 
      ORDER BY name ASC
    `);

    const catRows = await query(`SELECT * FROM categories ORDER BY code ASC`);
    const unsurRows = await query(`SELECT * FROM unsurs ORDER BY id ASC`);
    const indRows = await query(`SELECT * FROM indicators ORDER BY id ASC`);

    const penRows = await query(`
      SELECT 
        id, santri_id, santri_name, santri_class, santri_asrama,
        guru_id, guru_name, type, category, unsur_name,
        indicator_text, tingkat, score, notes, proof_file_name,
        proof_file_size, created_at, date_key
      FROM penilaian 
      ORDER BY created_at DESC
    `);

    const absRows = await query(`
      SELECT 
        id, santri_id, santri_name, santri_class, gender,
        guru_id, guru_name, waktu_sholat, date, status,
        score_impact, notes, created_at
      FROM absensi 
      ORDER BY created_at DESC
    `);

    const settingsRows = await query(`SELECT key, value FROM app_settings`);

    const backupPayload = {
      app: "MIZAN",
      institution: "Pondok Pesantren Modern Raudhatussalam Mahato",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      scope,
      counts: {
        santri: santriRows.length,
        classes: classRows.length,
        users: userRows.length,
        categories: catRows.length,
        unsurs: unsurRows.length,
        indicators: indRows.length,
        penilaian: penRows.length,
        absensi: absRows.length
      },
      data: {
        santri: santriRows,
        classes: classRows,
        users: userRows,
        categories: catRows,
        unsurs: unsurRows,
        indicators: indRows,
        penilaian: penRows,
        absensi: absRows,
        settings: settingsRows
      }
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `mizan_backup_${dateStr}.json`;

    if (isDownload) {
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      filename,
      ...backupPayload
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
