import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = 
  process.env.STORAGE_PRISMA_URL || 
  process.env.STORAGE_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: No se encontró ninguna variable de conexión a la base de datos (DATABASE_URL, POSTGRES_PRISMA_URL o STORAGE_URL). Verifica la configuración en Vercel.");
}

const pool = new Pool({ 
  connectionString: connectionString || "postgresql://missing_connection_string@localhost:5432/missing",
  connectionTimeoutMillis: 5000 
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const getSafeHostname = () => {
  if (!connectionString) return "No configurado (Variables faltantes)";
  try {
    const url = new URL(connectionString);
    return url.hostname;
  } catch {
    return "URL Inválida";
  }
};
