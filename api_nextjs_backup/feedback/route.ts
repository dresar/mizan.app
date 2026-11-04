import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { FeedbackRecord, INITIAL_FEEDBACKS } from "@/lib/mock-data";
import { formatWIBDateTime } from "@/lib/date-utils";
import { verifyRequestAuth } from "@/lib/auth-server";

let memoryFeedbacks: FeedbackRecord[] = [...INITIAL_FEEDBACKS];

async function ensureFeedbackTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(16) NOT NULL,
        category VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        page_url VARCHAR(255),
        user_id VARCHAR(64),
        user_name VARCHAR(128),
        user_role VARCHAR(32),
        ai_analysis JSONB,
        custom_prompt TEXT,
        status VARCHAR(32) DEFAULT 'Baru',
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch {
    void 0;
  }
}

export async function GET() {
  try {
    await ensureFeedbackTable();
    const rows = await query(`
      SELECT 
        id,
        type,
        category,
        title,
        description,
        page_url as "pageUrl",
        user_id as "userId",
        user_name as "userName",
        user_role as "userRole",
        ai_analysis as "aiAnalysis",
        custom_prompt as "customPrompt",
        status,
        admin_notes as "adminNotes",
        to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as "createdAt",
        to_char(updated_at, 'YYYY-MM-DD HH24:MI:SS') as "updatedAt"
      FROM feedbacks
      ORDER BY created_at DESC
    `);
    if (rows && rows.length > 0) {
      return NextResponse.json({ success: true, data: rows });
    }
  } catch {
    void 0;
  }
  return NextResponse.json({ success: true, data: memoryFeedbacks });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || "fb-" + Date.now().toString(36);
    const type = body.type || "SARAN";
    const category = body.category || "Umum";
    const title = body.title || "Masukan Pengguna";
    const description = body.description || "";
    const pageUrl = body.pageUrl || "";
    const userId = body.userId || "";
    const userName = body.userName || "Pengguna";
    const userRole = body.userRole || "GUEST";
    const aiAnalysis = body.aiAnalysis ? JSON.stringify(body.aiAnalysis) : null;
    const customPrompt = body.customPrompt || "";
    const status = "Baru";
    const nowStr = formatWIBDateTime(new Date());

    try {
      await ensureFeedbackTable();
      await query(
        `
        INSERT INTO feedbacks (
          id, type, category, title, description, page_url,
          user_id, user_name, user_role, ai_analysis, custom_prompt, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          ai_analysis = EXCLUDED.ai_analysis,
          custom_prompt = EXCLUDED.custom_prompt,
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          id,
          type,
          category,
          title,
          description,
          pageUrl,
          userId,
          userName,
          userRole,
          aiAnalysis,
          customPrompt,
          status
        ]
      );
    } catch {
      void 0;
    }

    const newRecord: FeedbackRecord = {
      id,
      type,
      category,
      title,
      description,
      pageUrl,
      userId,
      userName,
      userRole,
      aiAnalysis: body.aiAnalysis,
      customPrompt,
      status,
      createdAt: nowStr
    };

    memoryFeedbacks = [newRecord, ...memoryFeedbacks.filter((item) => item.id !== id)];
    return NextResponse.json({ success: true, data: newRecord, message: "Terkirim" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Gagal" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = verifyRequestAuth(req, "SUPER_ADMIN");
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Akses ditolak: Memerlukan hak akses Super Admin." },
        { status: 403 }
      );
    }
    const body = await req.json();
    const { id, status, adminNotes } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: "ID dibutuhkan" }, { status: 400 });
    }

    try {
      await ensureFeedbackTable();
      await query(
        `
        UPDATE feedbacks
        SET status = COALESCE($1, status),
            admin_notes = COALESCE($2, admin_notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        `,
        [status, adminNotes, id]
      );
    } catch {
      void 0;
    }

    const nowStr = formatWIBDateTime(new Date());
    memoryFeedbacks = memoryFeedbacks.map((item) =>
      item.id === id
        ? {
            ...item,
            status: status || item.status,
            adminNotes: adminNotes !== undefined ? adminNotes : item.adminNotes,
            updatedAt: nowStr
          }
        : item
    );

    return NextResponse.json({ success: true, message: "Diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Gagal" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = verifyRequestAuth(req, "SUPER_ADMIN");
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.message || "Akses ditolak: Memerlukan hak akses Super Admin." },
        { status: 403 }
      );
    }
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ID dibutuhkan" }, { status: 400 });
    }

    try {
      await ensureFeedbackTable();
      await query(`DELETE FROM feedbacks WHERE id = $1`, [id]);
    } catch {
      void 0;
    }

    memoryFeedbacks = memoryFeedbacks.filter((item) => item.id !== id);
    return NextResponse.json({ success: true, message: "Dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Gagal" }, { status: 400 });
  }
}
