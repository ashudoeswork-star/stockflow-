"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function getSalesOrders() {
  return prisma.salesOrder.findMany({
    where: { organizationId: DEFAULT_ORG_ID },
    include: {
      lineItems: {
        include: { product: { select: { name: true, sku: true, unit: true, onHand: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductsForSO() {
  return prisma.product.findMany({
    where: { organizationId: DEFAULT_ORG_ID },
    select: { id: true, name: true, sku: true, unit: true, onHand: true },
    orderBy: { name: "asc" },
  });
}

export async function createSalesOrder(formData: FormData) {
  const customer = formData.get("customer") as string;
  const deliveryDate = formData.get("deliveryDate") as string;
  const notes = formData.get("notes") as string;
  const productIds = formData.getAll("productId") as string[];
  const quantities = formData.getAll("quantity") as string[];

  if (!customer) throw new Error("Customer is required");
  if (productIds.length === 0) throw new Error("Add at least one line item");

  const count = await prisma.salesOrder.count({ where: { organizationId: DEFAULT_ORG_ID } });
  const soNumber = `SO-${String(count + 1).padStart(4, "0")}`;

  await prisma.salesOrder.create({
    data: {
      soNumber,
      customer,
      status: "DRAFT",
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
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

  revalidatePath("/sales-orders");
}

export async function confirmSO(id: string) {
  await prisma.salesOrder.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });
  revalidatePath("/sales-orders");
}

export async function dispatchSO(id: string) {
  await prisma.$transaction(async (tx) => {
    const so = await tx.salesOrder.findUnique({
      where: { id },
      include: { lineItems: true },
    });
    if (!so) throw new Error("SO not found");

    for (const item of so.lineItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      if (product.onHand < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} — only ${product.onHand} ${product.unit} available`);
      }

      const newBalance = product.onHand - item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { onHand: newBalance },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "OUT",
          quantity: item.quantity,
          reference: so.soNumber,
          balanceAfter: newBalance,
          organizationId: DEFAULT_ORG_ID,
        },
      });
    }

    await tx.salesOrder.update({ where: { id }, data: { status: "DISPATCHED" } });
  });

  revalidatePath("/sales-orders");
  revalidatePath("/products");
  revalidatePath("/movements");
}

export async function cancelSO(id: string) {
  await prisma.salesOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/sales-orders");
}
