import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function createAuditLog(action: string, details?: string) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    const userAgent = headerList.get("user-agent") || "unknown";

    // Simple device detection logic
    let device = "Desktop";
    if (/android/i.test(userAgent)) device = "Android Device";
    else if (/iphone|ipad|ipod/i.test(userAgent)) device = "Apple iOS Device";
    else if (/windows phone/i.test(userAgent)) device = "Windows Phone";

    // Try to extract more detail if possible
    const match = userAgent.match(/\(([^)]+)\)/);
    const deviceDetail = match ? match[1].split(";")[0] : device;

    await prisma.auditLog.create({
      data: {
        action,
        details,
        ip,
        device: `${device} (${deviceDetail})`,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
