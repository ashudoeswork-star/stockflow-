"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function getProducts(search?: string) {
  return prisma.product.findMany({
    where: {
      organizationId: DEFAULT_ORG_ID,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const unit = (formData.get("unit") as string) || "pcs";
  const category = formData.get("category") as string;
  const reorderLevel = parseInt(formData.get("reorderLevel") as string) || 0;

  if (!name || !sku) throw new Error("Name and SKU are required");

  await prisma.product.create({
    data: {
      name,
      sku,
      unit,
      category: category || null,
      reorderLevel,
      onHand: 0,
      organizationId: DEFAULT_ORG_ID,
    },
  });

  revalidatePath("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const unit = (formData.get("unit") as string) || "pcs";
  const category = formData.get("category") as string;
  const reorderLevel = parseInt(formData.get("reorderLevel") as string) || 0;

  if (!name || !sku) throw new Error("Name and SKU are required");

  await prisma.product.update({
    where: { id },
    data: { name, sku, unit, category: category || null, reorderLevel },
  });

  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
}
