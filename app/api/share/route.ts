import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyRequestAuth } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const rows = await query(`
        SELECT id, title, type, period, scope, data, created_at as "createdAt"
        FROM public_shares
        WHERE id = $1
        LIMIT 1
      `, [id.trim()]);

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Statistik tidak ditemukan." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        share: rows[0]
      });
    }

    const rows = await query(`
      SELECT id, title, type, period, scope, created_at as "createdAt"
      FROM public_shares
      ORDER BY created_at DESC
      LIMIT 20
    `);

    return NextResponse.json({
      success: true,
      shares: rows
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
    const auth = verifyRequestAuth(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Autentikasi diperlukan." },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { title, type, period, scope = "ALL", data } = body;

    if (!title || !type || !period || !data) {
      return NextResponse.json(
        { success: false, message: "Data statistik tidak lengkap." },
        { status: 400 }
      );
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const id = `stat-${Date.now().toString(36)}-${randomSuffix}`;

    await query(`
      INSERT INTO public_shares (id, title, type, period, scope, data)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, title, type, period, scope, JSON.stringify(data)]);

    return NextResponse.json({
      success: true,
      share: {
        id,
        title,
        type,
        period,
        scope,
        data
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
