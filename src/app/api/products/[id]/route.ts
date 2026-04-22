import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, stock, category, sku } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(category !== undefined && { category: category?.trim() || null }),
        ...(sku && { sku: sku.trim().toUpperCase() }),
      },
    });

    await createAuditLog("UPDATE_PRODUCT", `Editó: ${product.name} (SKU: ${product.sku})`);

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PATCH /api/products/:id]", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    
    if (product) {
      await prisma.product.delete({ where: { id } });
      await createAuditLog("DELETE_PRODUCT", `Eliminó: ${product.name} (SKU: ${product.sku})`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/products/:id]", error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
