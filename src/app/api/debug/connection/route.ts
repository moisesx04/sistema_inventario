import { getSafeHostname } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    hostname: getSafeHostname(),
    env: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
}
