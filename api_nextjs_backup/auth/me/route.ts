import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.userId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    if (session.role === "ORTU" || session.userId.startsWith("ortu-")) {
      const santriId = session.userId.replace(/^ortu-/, "");
      const santriRows = await query(`
        SELECT 
          id, nis, name, gender, class, asrama, kamar, 
          base_score as "baseScore", current_score as "currentScore", status, avatar,
          wali_name as "waliName", wali_phone as "waliPhone"
        FROM santri 
        WHERE id = $1 OR LOWER(nis) = LOWER($2)
        LIMIT 1
      `, [santriId, session.username || ""]);

      if (santriRows.length > 0) {
        const santri = santriRows[0];
        return NextResponse.json({
          authenticated: true,
          user: {
            id: `ortu-${santri.id}`,
            username: santri.nis,
            name: santri.waliName || `Wali ${santri.name}`,
            role: "ORTU",
            roleTitle: `Wali Santri (${santri.name})`,
            avatarInitials: santri.avatar || "WS",
            avatarUrl: "",
            gender: santri.gender,
            assignedClass: santri.class,
            isActive: true,
            santriId: santri.id
          }
        });
      }
    }

    const rows = await query(`
      SELECT 
        id, username, name, role, role_title as "roleTitle", 
        avatar_initials as "avatarInitials", avatar_url as "avatarUrl", 
        gender, assigned_class as "assignedClass", is_active as "isActive"
      FROM users 
      WHERE (id = $1 OR LOWER(username) = LOWER($2)) AND is_active = true
      LIMIT 1
    `, [session.userId, session.username || ""]);

    if (rows.length === 0) {
      return NextResponse.json({ authenticated: false, user: null });
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
