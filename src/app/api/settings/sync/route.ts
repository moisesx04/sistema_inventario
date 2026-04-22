import { execSync } from "child_process";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Este comando sincroniza el esquema de Prisma con la base de datos conectada
    // Es útil para inicializar bases de datos en Vercel sin acceso a terminal
    console.log("Iniciando sincronización de base de datos...");
    
    const connectionString = 
      process.env.STORAGE_PRISMA_URL || 
      process.env.STORAGE_URL || 
      process.env.POSTGRES_PRISMA_URL || 
      process.env.DATABASE_URL;

    const output = execSync("npx prisma db push --accept-data-loss", {
      encoding: "utf-8",
      env: {
        ...process.env,
        DATABASE_URL: connectionString,
      },
    });

    return NextResponse.json({
      message: "Base de datos sincronizada con éxito",
      output,
    });
  } catch (error: unknown) {
    console.error("Error en sincronización:", error);
    const err = error as { message?: string; stderr?: string };
    return NextResponse.json(
      { 
        error: "Fallo la sincronización", 
        details: err.message || String(error),
        stderr: err.stderr 
      },
      { status: 500 }
    );
  }
}
