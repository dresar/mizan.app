import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  Kategori,
  Santri,
  GuruMonitoring,
  PenilaianRecord,
  AbsensiRecord,
  UserProfile,
  AppSettings,
  DEFAULT_SETTINGS
} from "@/lib/mock-data";

export async function GET() {
  try {
    const santriRows = await query(`
      SELECT 
        id, nis, name, gender, class, asrama, kamar, 
        base_score as "baseScore", current_score as "currentScore", status, avatar,
        wali_name as "waliName", wali_phone as "waliPhone",
        COALESCE(total_hadir, 28) as "totalHadir",
        COALESCE(total_alpa, 0) as "totalAlpa"
      FROM santri ORDER BY name ASC
    `);

    const userRows = await query(`
      SELECT 
        id, username, name, role, role_title as "roleTitle", 
        avatar_initials as "avatarInitials", avatar_url as "avatarUrl", 
        gender, assigned_class as "assignedClass", is_active as "isActive"
      FROM users 
      WHERE is_active = true 
      ORDER BY name ASC
    `);

    const classRows = await query(`
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

    const guruRows = await query(`
      SELECT 
        COALESCE(gm.id, 'guru-' || u.id) as id,
        u.name,
        u.gender,
        COALESCE(gm.assigned_class, u.assigned_class, '1A') as "assignedClass",
        COALESCE(gm.asrama, CASE WHEN u.gender = 'Putri' THEN 'Asrama Khadijah' ELSE 'Asrama Salman Al-Farisi' END) as asrama,
        COALESCE(gm.last_login, 'Aktif') as "lastLogin",
        COALESCE(gm.report_count_today, 0) as "reportCountToday",
        COALESCE(gm.status, 'Belum Lapor') as status
      FROM users u
      LEFT JOIN guru_monitoring gm ON (gm.name = u.name OR gm.id = u.id OR gm.id = 'guru-' || u.id)
      WHERE u.role IN ('GURU', 'PENGASUHAN') AND u.is_active = true
      ORDER BY u.name ASC
    `);

    const catRows = await query(`SELECT id, code, name FROM categories ORDER BY code ASC`);
    const unsurRows = await query(`SELECT id, category_name as "categoryName", name, COALESCE(type, 'HASANAH') as type FROM unsurs ORDER BY id ASC`);
    const indRows = await query(`
      SELECT id, unsur_id as "unsurId", text, type, default_score as "defaultScore", tingkat 
      FROM indicators ORDER BY id ASC
    `);

    const categories: Kategori[] = catRows.map((cat: any) => {
      const unsurs = unsurRows
        .filter((u: any) => u.categoryName === cat.name)
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          type: u.type,
          indicators: indRows
            .filter((i: any) => i.unsurId === u.id)
            .map((i: any) => ({
              id: i.id,
              text: i.text,
              type: i.type,
              defaultScore: parseFloat(i.defaultScore),
              tingkat: i.tingkat
            }))
        }));
      return {
        code: cat.code,
        name: cat.name,
        unsurs
      };
    });

    const penRows = await query(`
      SELECT 
        id, santri_id as "santriId", santri_name as "santriName",
        santri_class as "santriClass", santri_asrama as "santriAsrama",
        guru_id as "guruId", guru_name as "guruName", type, category,
        unsur_name as "unsurName", indicator_text as "indicatorText",
        tingkat, score, notes, proof_file_name as "proofFileName",
        proof_file_size as "proofFileSize", created_at as "createdAt",
        date_key as "dateKey",
        incident_date as "incidentDate",
        incident_time as "incidentTime",
        location,
        witness_name as "witnessName",
        due_process_status as "dueProcessStatus",
        sanggahan_reason as "sanggahanReason",
        sanggahan_at as "sanggahanAt",
        sanggahan_decision as "sanggahanDecision",
        sanggahan_decision_by as "sanggahanDecisionBy",
        sanggahan_notes as "sanggahanNotes"
      FROM penilaian ORDER BY created_at DESC LIMIT 300
    `);

    const absRows = await query(`
      SELECT 
        id, santri_id as "santriId", santri_name as "santriName",
        santri_class as "santriClass", gender, guru_id as "guruId",
        guru_name as "guruName", COALESCE(waktu_sholat, 'Subuh') as "waktuSholat",
        date, status, score_impact as "scoreImpact",
        notes, created_at as "createdAt"
      FROM absensi ORDER BY created_at DESC LIMIT 2500
    `);

    const settingsRows = await query(`
      SELECT value FROM app_settings WHERE key = 'general' LIMIT 1
    `);

    const formattedSantri: Santri[] = santriRows.map((s: any) => ({
      id: s.id,
      nis: s.nis,
      name: s.name,
      gender: s.gender,
      class: s.class,
      asrama: s.asrama,
      kamar: s.kamar,
      baseScore: parseFloat(s.baseScore),
      currentScore: parseFloat(s.currentScore),
      status: s.status,
      avatar: s.avatar,
      waliName: s.waliName,
      waliPhone: s.waliPhone,
      totalHadir: parseInt(s.totalHadir, 10),
      totalAlpa: parseInt(s.totalAlpa, 10)
    }));

    const formattedUsers: UserProfile[] = userRows.map((u: any) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      roleTitle: u.roleTitle,
      avatarInitials: u.avatarInitials,
      avatarUrl: u.avatarUrl,
      gender: u.gender,
      assignedClass: u.assignedClass,
      isActive: u.isActive
    }));

    const formattedPenilaian: PenilaianRecord[] = penRows.map((p: any) => {
      const dt = new Date(p.createdAt);
      const isValid = !isNaN(dt.getTime());
      const formattedDate = isValid
        ? dt.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) + " • " + dt.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }) + " WIB"
        : "Baru saja";
      return {
        ...p,
        score: parseFloat(p.score),
        createdAt: formattedDate,
        date: isValid ? dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "",
        rawCreatedAt: isValid ? dt.toISOString() : undefined
      };
    });

    const formattedAbsensi: AbsensiRecord[] = absRows.map((a: any) => {
      const dt = new Date(a.createdAt);
      const isValid = !isNaN(dt.getTime());
      const timeStr = isValid
        ? dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
        : "";
      return {
        ...a,
        scoreImpact: parseFloat(a.scoreImpact),
        createdAt: timeStr || "Baru saja",
        rawCreatedAt: isValid ? dt.toISOString() : undefined
      };
    });

    const kelasList: string[] = classRows.map((c: any) => c.name);
    const settings: AppSettings = settingsRows.length > 0 ? settingsRows[0].value : DEFAULT_SETTINGS;

    return NextResponse.json({
      success: true,
      santri: formattedSantri,
      users: formattedUsers,
      kelasList,
      classList: classRows,
      guruList: guruRows,
      categories,
      penilaianList: formattedPenilaian,
      absensiList: formattedAbsensi,
      settings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
