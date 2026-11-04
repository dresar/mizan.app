import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "downloads", "mizan.mobileconfig");
  
  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/x-apple-aspen-config; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mizan.mobileconfig"',
      "Cache-Control": "public, max-age=3600"
    }
  });
}
