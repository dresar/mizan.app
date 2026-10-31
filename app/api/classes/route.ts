import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`SELECT name FROM classes ORDER BY name ASC`);
    return NextResponse.json({ success: true, classes: rows.map((r: any) => r.name) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama kelas wajib diisi." },
        { status: 400 }
      );
    }

    const className = name.trim().toUpperCase();
    const id = "cls-" + className.toLowerCase();

    await query(`
      INSERT INTO classes (id, name)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
    `, [id, className]);

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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kelas wajib disertakan." },
        { status: 400 }
      );
    }

    await query(`DELETE FROM classes WHERE UPPER(name) = UPPER($1)`, [name.trim()]);

    return NextResponse.json({
      success: true,
      message: `Kelas ${name} berhasil dihapus.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
