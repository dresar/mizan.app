import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.userId) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const rows = await query(`
      SELECT 
        id, username, name, role, role_title as "roleTitle", 
        avatar_initials as "avatarInitials", avatar_url as "avatarUrl", 
        gender, assigned_class as "assignedClass", is_active as "isActive"
      FROM users 
      WHERE id = $1 AND is_active = true
      LIMIT 1
    `, [session.userId]);

    if (rows.length === 0) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: rows[0]
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}
