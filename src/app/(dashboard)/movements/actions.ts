"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function getMovements() {
  return prisma.stockMovement.findMany({
    where: { organizationId: DEFAULT_ORG_ID },
    include: { product: { select: { name: true, sku: true, unit: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getProductsForSelect() {
  return prisma.product.findMany({
    where: { organizationId: DEFAULT_ORG_ID },
    select: { id: true, name: true, sku: true, onHand: true, unit: true },
    orderBy: { name: "asc" },
  });
}

export async function createMovement(formData: FormData) {
  const productId = formData.get("productId") as string;
  const type = formData.get("type") as MovementType;
  const quantity = parseInt(formData.get("quantity") as string);
  const reference = formData.get("reference") as string;

  if (!productId || !type || !quantity || quantity <= 0) {
    throw new Error("Product, type, and a positive quantity are required");
  }

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    const newBalance =
      type === "IN" ? product.onHand + quantity : product.onHand - quantity;

    if (newBalance < 0) {
      throw new Error(
        `Insufficient stock — only ${product.onHand} ${product.unit} available`
      );
    }

    await tx.product.update({
      where: { id: productId },
      data: { onHand: newBalance },
    });

    await tx.stockMovement.create({
      data: {
        productId,
        type,
        quantity,
        reference: reference || null,
        balanceAfter: newBalance,
        organizationId: DEFAULT_ORG_ID,
      },
    });
  });

  revalidatePath("/movements");
  revalidatePath("/products");
}
