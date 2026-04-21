import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category") || "";

    const products = await prisma.product.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { sku: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          category ? { category: { equals: category, mode: "insensitive" } } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, stock, category, sku } = body;

    if (!name || !sku || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Campos requeridos: name, sku, price, stock" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese SKU" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        category: category?.trim() || null,
        sku: sku.trim().toUpperCase(),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/products] Full Error:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear el producto" },
      { status: 500 }
    );
  }
}
