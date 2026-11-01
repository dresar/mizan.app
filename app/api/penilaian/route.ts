import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.santriId) {
      return NextResponse.json({ success: false, message: "ID santri wajib diisi." }, { status: 400 });
    }

    const santriRes = await query(
      "SELECT id, name, class, asrama, gender, current_score FROM santri WHERE id = $1",
      [body.santriId]
    );

    const santriObj = santriRes[0] || {};
    const santriName = body.santriName || santriObj.name || "Santri";
    const santriClass = body.santriClass || santriObj.class || "1A";
    const santriAsrama = body.santriAsrama || santriObj.asrama || (santriObj.gender === "Putri" ? "Asrama Khadijah" : "Asrama Salman Al-Farisi");
    const guruId = body.guruId || "guru-system";
    const guruName = body.guruName || "Pengasuhan Pondok";
    const category = body.category || "Kedisiplinan & Adab";
    const unsurName = body.unsurName || "Ketertiban";
    const indicatorText = body.indicatorText || unsurName;
    const type = body.type === "SAYYIAH" ? "SAYYIAH" : "HASANAH";
    const scoreVal = typeof body.score === "number" && !isNaN(body.score) ? body.score : parseFloat(body.score) || (type === "HASANAH" ? 0.05 : -0.05);

    const id = "pen-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);

    const createdAtDate = body.createdAt ? new Date(body.createdAt) : new Date();
    const validCreatedAt = isNaN(createdAtDate.getTime()) ? new Date() : createdAtDate;
    const dateKey = body.dateKey || validCreatedAt.toISOString().split("T")[0];

    const incidentDate = body.incidentDate || (body.dateKey || validCreatedAt.toISOString().split("T")[0]);
    const incidentTime = body.incidentTime || validCreatedAt.toTimeString().substring(0, 5);
    const location = body.location || "Lingkungan Pondok";
    const witnessName = body.witnessName || null;
    const dueProcessStatus = body.dueProcessStatus || "DISAHKAN";

    await query(
      `INSERT INTO penilaian (
        id, santri_id, santri_name, santri_class, santri_asrama,
        guru_id, guru_name, type, category, unsur_name,
        indicator_text, tingkat, score, notes, proof_file_name,
        proof_file_size, created_at, date_key,
        incident_date, incident_time, location, witness_name, due_process_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
      [
        id,
        body.santriId,
        santriName,
        santriClass,
        santriAsrama,
        guruId,
        guruName,
        type,
        category,
        unsurName,
        indicatorText,
        body.tingkat || "Sedang",
        scoreVal,
        body.notes || "",
        body.proofFileName || null,
        body.proofFileSize || null,
        validCreatedAt,
        dateKey,
        incidentDate,
        incidentTime,
        location,
        witnessName,
        dueProcessStatus
      ]
    );

    if (santriRes.length > 0 && dueProcessStatus !== "DIBATALKAN") {
      const prevScore = parseFloat(santriRes[0].current_score) || 80.0;
      const newScore = Math.max(0, Math.min(100, Number((prevScore + scoreVal).toFixed(3))));
      let newStatus = "Aman";
      if (newScore < 16) newStatus = "Pengembalian";
      else if (newScore < 31) newStatus = "SP 3";
      else if (newScore < 46) newStatus = "SP 2";
      else if (newScore < 61) newStatus = "SP 1";
      else if (newScore < 80) newStatus = "Peringatan Lisan";

      await query(
        "UPDATE santri SET current_score = $1, status = $2 WHERE id = $3",
        [newScore, newStatus, body.santriId]
      );
    }

    if (guruName) {
      await query(
        `UPDATE guru_monitoring 
         SET report_count_today = report_count_today + 1, status = 'Sudah Lapor' 
         WHERE name = $1`,
        [guruName]
      );
    }

    return NextResponse.json({ success: true, id, message: "Penilaian berhasil disimpan." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Terjadi kendala saat menyimpan penilaian.", error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID penilaian diperlukan." }, { status: 400 });

    const penRes = await query("SELECT santri_id, score, due_process_status FROM penilaian WHERE id = $1", [id]);
    if (penRes.length > 0) {
      const { santri_id, score, due_process_status } = penRes[0];
      const santriRes = await query("SELECT current_score FROM santri WHERE id = $1", [santri_id]);
      if (santriRes.length > 0 && due_process_status !== "DIBATALKAN") {
        const prev = parseFloat(santriRes[0].current_score) || 80.0;
        const scoreVal = parseFloat(score) || 0;
        const rolledBack = Math.max(0, Math.min(100, Number((prev - scoreVal).toFixed(3))));
        let newStatus = "Aman";
        if (rolledBack < 16) newStatus = "Pengembalian";
        else if (rolledBack < 31) newStatus = "SP 3";
        else if (rolledBack < 46) newStatus = "SP 2";
        else if (rolledBack < 61) newStatus = "SP 1";
        else if (rolledBack < 80) newStatus = "Peringatan Lisan";

        await query("UPDATE santri SET current_score = $1, status = $2 WHERE id = $3", [
          rolledBack,
          newStatus,
          santri_id
        ]);
      }
      await query("DELETE FROM penilaian WHERE id = $1", [id]);
    }

    return NextResponse.json({ success: true, message: "Penilaian berhasil dihapus." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Terjadi kendala saat menghapus penilaian." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, action } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: "ID penilaian diperlukan." }, { status: 400 });
    }

    const penRes = await query("SELECT * FROM penilaian WHERE id = $1", [id]);
    if (penRes.length === 0) {
      return NextResponse.json({ success: false, message: "Data penilaian tidak ditemukan." }, { status: 404 });
    }

    const item = penRes[0];

    if (action === "sanggah") {
      const { reason } = body;
      if (!reason || !reason.trim()) {
        return NextResponse.json({ success: false, message: "Alasan sanggahan wajib diisi." }, { status: 400 });
      }

      await query(
        `UPDATE penilaian 
         SET due_process_status = 'SANGGAHAN', sanggahan_reason = $1, sanggahan_at = NOW() 
         WHERE id = $2`,
        [reason.trim(), id]
      );

      return NextResponse.json({ success: true, message: "Sanggahan berhasil diajukan." });
    }

    if (action === "resolve_sanggahan") {
      const { decision, staffName, notes } = body;
      if (decision === "TERIMA") {
        await query(
          `UPDATE penilaian 
           SET due_process_status = 'DIBATALKAN', sanggahan_decision = 'TERIMA', 
               sanggahan_decision_by = $1, sanggahan_notes = $2 
           WHERE id = $3`,
          [staffName || "Pengasuhan", notes || "Sanggahan diterima, pemotongan poin dibatalkan.", id]
        );

        const santriRes = await query("SELECT current_score FROM santri WHERE id = $1", [item.santri_id]);
        if (santriRes.length > 0) {
          const prev = parseFloat(santriRes[0].current_score) || 80.0;
          const scoreVal = parseFloat(item.score) || 0;
          const restored = Math.max(0, Math.min(100, Number((prev - scoreVal).toFixed(3))));
          let newStatus = "Aman";
          if (restored < 16) newStatus = "Pengembalian";
          else if (restored < 31) newStatus = "SP 3";
          else if (restored < 46) newStatus = "SP 2";
          else if (restored < 61) newStatus = "SP 1";
          else if (restored < 80) newStatus = "Peringatan Lisan";

          await query("UPDATE santri SET current_score = $1, status = $2 WHERE id = $3", [
            restored,
            newStatus,
            item.santri_id
          ]);
        }

        return NextResponse.json({ success: true, message: "Sanggahan diterima dan poin telah dipulihkan." });
      } else {
        await query(
          `UPDATE penilaian 
           SET due_process_status = 'DISAHKAN', sanggahan_decision = 'TOLAK', 
               sanggahan_decision_by = $1, sanggahan_notes = $2 
           WHERE id = $3`,
          [staffName || "Pengasuhan", notes || "Sanggahan ditolak setelah sidang klarifikasi.", id]
        );

        return NextResponse.json({ success: true, message: "Sanggahan ditolak dan sanksi poin disahkan." });
      }
    }

    if (action === "konfirmasi") {
      await query(
        `UPDATE penilaian SET due_process_status = 'DISAHKAN' WHERE id = $1`,
        [id]
      );
      return NextResponse.json({ success: true, message: "Nota poin berhasil disahkan." });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server.", error: err?.message }, { status: 500 });
  }
}
