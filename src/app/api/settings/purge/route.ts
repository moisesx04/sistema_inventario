import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const PURGE_PASSWORD = "admin2024"; // change before going to production

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password !== PURGE_PASSWORD) {
      return NextResponse.json(
        { error: "Contraseña incorrecta. Acceso denegado." },
        { status: 401 }
      );
    }

    const { count } = await prisma.product.deleteMany({});

    await createAuditLog("PURGE_DATABASE", `Vació el inventario cloud. (${count} productos eliminados)`);

    return NextResponse.json({
      success: true,
      deleted: count,
      message: `Se eliminaron ${count} productos del inventario local.`,
    });
  } catch (error) {
    console.error("[DELETE /api/settings/purge]", error);
    return NextResponse.json(
      { error: "Error al purgar la base de datos" },
      { status: 500 }
    );
  }
}
