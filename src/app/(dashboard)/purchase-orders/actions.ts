"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { POStatus } from "@prisma/client";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function getPurchaseOrders() {
  return prisma.purchaseOrder.findMany({
    where: { organizationId: DEFAULT_ORG_ID },
    include: { lineItems: { include: { product: { select: { name: true, sku: true, unit: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductsForPO() {
  return prisma.product.findMany({
    where: { organizationId: DEFAULT_ORG_ID },
    select: { id: true, name: true, sku: true, unit: true },
    orderBy: { name: "asc" },
  });
}

export async function createPurchaseOrder(formData: FormData) {
  const supplier = formData.get("supplier") as string;
  const expectedDate = formData.get("expectedDate") as string;
  const notes = formData.get("notes") as string;
  const productIds = formData.getAll("productId") as string[];
  const quantities = formData.getAll("quantity") as string[];

  if (!supplier) throw new Error("Supplier is required");
  if (productIds.length === 0) throw new Error("Add at least one line item");

  const count = await prisma.purchaseOrder.count({ where: { organizationId: DEFAULT_ORG_ID } });
  const poNumber = `PO-${String(count + 1).padStart(4, "0")}`;

  await prisma.purchaseOrder.create({
    data: {
      poNumber,
      supplier,
      status: "DRAFT",
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      notes: notes || null,
      organizationId: DEFAULT_ORG_ID,
      lineItems: {
        create: productIds.map((productId, i) => ({
          productId,
          quantity: parseInt(quantities[i]) || 1,
        })),
      },
    },
  });

  revalidatePath("/purchase-orders");
}

export async function markAsOrdered(id: string) {
  await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "ORDERED" },
  });
  revalidatePath("/purchase-orders");
}

export async function markAsReceived(id: string) {
  await prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findUnique({
      where: { id },
      include: { lineItems: true },
    });
    if (!po) throw new Error("PO not found");

    for (const item of po.lineItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const newBalance = product.onHand + item.quantity;
      await tx.product.update({ where: { id: item.productId }, data: { onHand: newBalance } });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "IN",
          quantity: item.quantity,
          reference: po.poNumber,
          balanceAfter: newBalance,
          organizationId: DEFAULT_ORG_ID,
        },
      });
    }

    await tx.purchaseOrder.update({ where: { id }, data: { status: "RECEIVED" } });
  });

  revalidatePath("/purchase-orders");
  revalidatePath("/products");
  revalidatePath("/movements");
}

export async function cancelPO(id: string) {
  await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/purchase-orders");
}
