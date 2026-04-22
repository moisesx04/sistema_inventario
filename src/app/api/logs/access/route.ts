import { createAuditLog } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await createAuditLog("ACCESO AL SISTEMA", "El usuario entró al panel principal");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log access" }, { status: 500 });
  }
}
