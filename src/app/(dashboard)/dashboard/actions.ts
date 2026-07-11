import { prisma } from "@/lib/prisma";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function getDashboardData() {
  const [
    products,
    recentMovements,
    openPOs,
    openSOs,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId: DEFAULT_ORG_ID },
      orderBy: { onHand: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: { organizationId: DEFAULT_ORG_ID },
      include: { product: { select: { name: true, sku: true, unit: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.purchaseOrder.count({
      where: { organizationId: DEFAULT_ORG_ID, status: { in: ["DRAFT", "ORDERED"] } },
    }),
    prisma.salesOrder.count({
      where: { organizationId: DEFAULT_ORG_ID, status: { in: ["DRAFT", "CONFIRMED"] } },
    }),
  ]);

  const totalProducts = products.length;
  const totalOnHand = products.reduce((sum, p) => sum + p.onHand, 0);
  const lowStock = products.filter(p => p.onHand <= p.reorderLevel && p.reorderLevel > 0);
  const outOfStock = products.filter(p => p.onHand === 0);

  return {
    totalProducts,
    totalOnHand,
    lowStock,
    outOfStock,
    recentMovements,
    openPOs,
    openSOs,
  };
}
