import { execSync } from "child_process";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Este comando sincroniza el esquema de Prisma con la base de datos conectada
    // Es útil para inicializar bases de datos en Vercel sin acceso a terminal
    console.log("Iniciando sincronización de base de datos...");
    
    const output = execSync("npx prisma db push --accept-data-loss", {
      encoding: "utf-8",
      env: {
        ...process.env,
        // Forzamos el uso de la variable de Vercel si existe
        DATABASE_URL: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
      },
    });

    return NextResponse.json({
      message: "Base de datos sincronizada con éxito",
      output,
    });
  } catch (error: any) {
    console.error("Error en sincronización:", error);
    return NextResponse.json(
      { 
        error: "Fallo la sincronización", 
        details: error.message,
        stderr: error.stderr 
      },
      { status: 500 }
    );
  }
}
