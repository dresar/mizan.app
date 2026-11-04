import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyRequestAuth } from "@/lib/auth-server";

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
    const { action } = body;

    if (action === "ADD_CATEGORY") {
      const { code, name } = body;
      const id = "cat-" + Date.now();
      await query("INSERT INTO categories (id, code, name) VALUES ($1,$2,$3)", [id, code, name]);
      return NextResponse.json({ success: true, id });
    }

    if (action === "ADD_UNSUR") {
      const { categoryName, unsurName } = body;
      const id = "unsur-" + Date.now();
      await query("INSERT INTO unsurs (id, category_name, name) VALUES ($1,$2,$3)", [
        id,
        categoryName,
        unsurName
      ]);
      return NextResponse.json({ success: true, id });
    }

    if (action === "ADD_INDICATOR") {
      const { unsurId, text, type, defaultScore, tingkat } = body;
      const id = "ind-" + Date.now();
      await query(
        "INSERT INTO indicators (id, unsur_id, text, type, default_score, tingkat) VALUES ($1,$2,$3,$4,$5,$6)",
        [id, unsurId, text, type, defaultScore, tingkat || "Sedang"]
      );
      return NextResponse.json({ success: true, id });
    }

    if (action === "UPDATE_INDICATOR") {
      const { indId, text, type, defaultScore, tingkat } = body;
      await query(
        "UPDATE indicators SET text = $1, type = $2, default_score = $3, tingkat = $4 WHERE id = $5",
        [text, type, defaultScore, tingkat, indId]
      );
      return NextResponse.json({ success: true });
    }

    if (action === "DELETE_INDICATOR") {
      const { indId } = body;
      await query("DELETE FROM indicators WHERE id = $1", [indId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
