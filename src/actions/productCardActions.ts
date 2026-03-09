"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PRODUCT_CARD_CONFIG = [
  {
    slug: "plant-products",
    name: "Plant Products",
    name_ar: "المنتجات النباتية",
    description: "Products for general plant care and fertilization",
    description_ar: "منتجات للعناية العامة بالنبات والتسميد",
    parentSlugs: ["plant-wealth", "plant-production"],
    order: 1,
  },
  {
    slug: "crops",
    name: "Crops",
    name_ar: "المحاصيل",
    description: "Specialized crop-specific solutions",
    description_ar: "حلول متخصصة خاصة بالمحاصيل",
    parentSlugs: ["plant-wealth", "plant-production"],
    order: 2,
  },
  {
    slug: "animal-products",
    name: "Animal Products",
    name_ar: "المنتجات الحيوانية",
    description: "General animal health and nutrition products",
    description_ar: "منتجات عامة لصحة وتغذية الحيوان",
    parentSlugs: ["livestock", "animal-production"],
    order: 1,
  },
  {
    slug: "by-animal-type",
    name: "By Animal Type",
    name_ar: "حسب نوع الحيوان",
    description: "Products categorized by animal type",
    description_ar: "منتجات مصنفة حسب نوع الحيوان",
    parentSlugs: ["livestock", "animal-production"],
    order: 2,
  },
] as const;

async function ensureProductCardsForAdmin() {
  const existingCards = await prisma.category.findMany({
    where: { slug: { in: PRODUCT_CARD_CONFIG.map((item) => item.slug) } },
    select: { slug: true },
  });

  const existingSlugs = new Set(existingCards.map((item) => item.slug));
  const missingCards = PRODUCT_CARD_CONFIG.filter((item) => !existingSlugs.has(item.slug));

  for (const card of missingCards) {
    const parent = await prisma.category.findFirst({
      where: { slug: { in: [...card.parentSlugs] } },
      select: { id: true },
      orderBy: { order: "asc" },
    });

    await prisma.category.create({
      data: {
        slug: card.slug,
        name: card.name,
        name_ar: card.name_ar,
        description: card.description,
        description_ar: card.description_ar,
        parentId: parent?.id || null,
        isActive: true,
        order: card.order,
      },
    });
  }
}

export async function getProductCardsForAdmin() {
  await ensureProductCardsForAdmin();

  const cards = await prisma.category.findMany({
    where: {
      slug: { in: PRODUCT_CARD_CONFIG.map((item) => item.slug) },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      name_ar: true,
      image: true,
      icon: true,
      parent: {
        select: {
          slug: true,
          name: true,
          name_ar: true,
        },
      },
    },
    orderBy: [{ parentId: "asc" }, { order: "asc" }],
  });

  const indexBySlug = new Map<string, number>(PRODUCT_CARD_CONFIG.map((item, index) => [item.slug, index]));
  return cards.sort((a, b) => (indexBySlug.get(a.slug) ?? 0) - (indexBySlug.get(b.slug) ?? 0));
}

export async function updateProductCardMedia(id: string, data: { image?: string; icon?: string }) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.category.update({
    where: { id },
    data: {
      image: data.image?.trim() || null,
      icon: data.icon?.trim() || null,
    },
  });

  revalidatePath("/products");
  revalidatePath("/products/plant-wealth");
  revalidatePath("/products/livestock");
  revalidatePath("/admin/product-cards");
}
