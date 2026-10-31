import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = "pen-" + Date.now();

    await query(
      `INSERT INTO penilaian (
        id, santri_id, santri_name, santri_class, santri_asrama,
        guru_id, guru_name, type, category, unsur_name,
        indicator_text, tingkat, score, notes, proof_file_name,
        proof_file_size, created_at, date_key
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),$17)`,
      [
        id,
        body.santriId,
        body.santriName,
        body.santriClass,
        body.santriAsrama,
        body.guruId,
        body.guruName,
        body.type,
        body.category,
        body.unsurName,
        body.indicatorText,
        body.tingkat || "Sedang",
        body.score,
        body.notes || "",
        body.proofFileName || null,
        body.proofFileSize || null,
        "today"
      ]
    );

    const santriRes = await query("SELECT current_score FROM santri WHERE id = $1", [body.santriId]);
    if (santriRes.length > 0) {
      const prevScore = parseFloat(santriRes[0].current_score);
      const newScore = Math.max(0, Math.min(99, Number((prevScore + body.score).toFixed(3))));
      let newStatus = "Baik";
      if (newScore < 60) newStatus = "Perlu Pembinaan";
      else if (newScore < 70) newStatus = "Perhatian";

      await query(
        "UPDATE santri SET current_score = $1, status = $2 WHERE id = $3",
        [newScore, newStatus, body.santriId]
      );
    }

    await query(
      `UPDATE guru_monitoring 
       SET report_count_today = report_count_today + 1, status = 'Sudah Lapor' 
       WHERE name = $1`,
      [body.guruName]
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const penRes = await query("SELECT santri_id, score FROM penilaian WHERE id = $1", [id]);
    if (penRes.length > 0) {
      const { santri_id, score } = penRes[0];
      const santriRes = await query("SELECT current_score FROM santri WHERE id = $1", [santri_id]);
      if (santriRes.length > 0) {
        const prev = parseFloat(santriRes[0].current_score);
        const rolledBack = Math.max(0, Math.min(99, Number((prev - parseFloat(score)).toFixed(3))));
        let newStatus = "Baik";
        if (rolledBack < 60) newStatus = "Perlu Pembinaan";
        else if (rolledBack < 70) newStatus = "Perhatian";

        await query("UPDATE santri SET current_score = $1, status = $2 WHERE id = $3", [
          rolledBack,
          newStatus,
          santri_id
        ]);
      }
      await query("DELETE FROM penilaian WHERE id = $1", [id]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
