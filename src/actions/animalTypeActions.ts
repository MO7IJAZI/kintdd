"use server";

import prisma from "@/lib/prisma";
import { generateSlug, generateGlobalUniqueSlug, checkSlugExistsGlobal } from "@/lib/slugUtils";
import { revalidatePath, revalidateTag } from "next/cache";

export async function listAnimalTypes() {
  return prisma.animalType.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: { issues: { where: { isActive: true }, orderBy: { order: 'asc' } } }
  });
}

export async function getAnimalType(id: string) {
  return prisma.animalType.findUnique({
    where: { id },
    include: { 
      issues: { orderBy: { order: 'asc' } },
      products: { select: { id: true } },
      tabs: { 
        orderBy: { order: 'asc' },
        include: {
          images: { orderBy: { order: 'asc' } }
        }
      }
    }
  });
}




export async function createAnimalType(data: {
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  imageUrl?: string;
  icon?: string;
  pdfUrl?: string;
  pdfUrl_ar?: string;
  documentTitle?: string;
  documentTitle_ar?: string;
  category?: string;
  category_ar?: string;
  productionSeason_ar?: string;
  metaTitle?: string;
  metaTitle_ar?: string;
  productIds?: string[];
  order?: number;
  isActive?: boolean;
  issues?: Array<{ title: string; title_ar?: string; description?: string; description_ar?: string; order?: number; isActive?: boolean, recommendation?: any }>;
}) {
  // Ensure slug is present and unique globally
  let finalSlug = data.slug;
  
  if (!finalSlug || !finalSlug.trim()) {
      // If no slug provided, generate a guaranteed unique one from name
      finalSlug = await generateGlobalUniqueSlug(data.name);
  } else {
      // If slug provided, clean it
      finalSlug = generateSlug(finalSlug);
      // Check if it exists
      if (await checkSlugExistsGlobal(finalSlug)) {
           // If exists, generate unique version
           finalSlug = await generateGlobalUniqueSlug(finalSlug);
      }
  }

  const result = await prisma.animalType.create({
    data: {
      name: data.name,
      name_ar: data.name_ar || null,
      slug: finalSlug,
      description: data.description || null,
      description_ar: data.description_ar || null,
      category: data.category || null,
      category_ar: data.category_ar || null,
      productionSeason_ar: data.productionSeason_ar || null,
      metaTitle: data.metaTitle || null,
      metaTitle_ar: data.metaTitle_ar || null,
      products: {
        connect: (data.productIds || []).map(id => ({ id }))
      },
      imageUrl: data.imageUrl || null,
      icon: data.icon || null,
      pdfUrl: data.pdfUrl || null,
      pdfUrl_ar: data.pdfUrl_ar || null,
      documentTitle: data.documentTitle || null,
      documentTitle_ar: data.documentTitle_ar || null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
      issues: {
        create: (data.issues || []).map(i => ({
          title: i.title,
          title_ar: i.title_ar || null,
          description: i.description || null,
          description_ar: i.description_ar || null,
          order: i.order ?? 0,
          isActive: i.isActive ?? true,
          recommendation: i.recommendation ? i.recommendation : null
        }))
      }
    }
  });

  revalidatePath("/admin/animal-types");
  revalidatePath("/products");
  revalidatePath("/ar/products");
  revalidatePath("/en/products");
  
  // revalidateTag takes no options, just the tag name
  // revalidateTag("animalTypes"); // Correct usage if the tag exists
  
  return result;
}

export async function updateAnimalType(id: string, data: {
  name?: string;
  name_ar?: string;
  slug?: string;
  description?: string;
  description_ar?: string;
  imageUrl?: string;
  icon?: string;
  pdfUrl?: string;
  pdfUrl_ar?: string;
  documentTitle?: string;
  documentTitle_ar?: string;
  category?: string;
  category_ar?: string;
  productionSeason_ar?: string;
  metaTitle?: string;
  metaTitle_ar?: string;
  productIds?: string[];
  order?: number;
  isActive?: boolean;
  issues?: Array<{ id?: string; title: string; title_ar?: string; description?: string; description_ar?: string; order?: number; isActive?: boolean; recommendation?: any }>;
}) {
  // Fetch current state including relations to compare
  const current = await prisma.animalType.findUnique({
    where: { id },
    include: {
      issues: true,
    }
  });

  if (!current) throw new Error("Animal Type not found");

  // --- Slug Handling ---
  let finalSlug = current.slug;
  if (data.slug !== undefined) {
      const incomingSlug = data.slug ? generateSlug(data.slug) : (data.name ? generateSlug(data.name) : current.slug);
      
      // Only run expensive global check if slug has actually changed
      if (incomingSlug !== current.slug) {
          if (await checkSlugExistsGlobal(incomingSlug, id)) {
              finalSlug = await generateGlobalUniqueSlug(incomingSlug, id);
          } else {
              finalSlug = incomingSlug;
          }
      }
  }

  // --- Issues --- 
  const existingIssues = current.issues;
  const existingIssueIds = new Set(existingIssues.map(e => e.id));
  const incomingIssueIds = new Set((data.issues || []).map(i => i.id).filter((id): id is string => !!id));
  const issuesToDelete = [...existingIssueIds].filter(x => !incomingIssueIds.has(x));

  // Perform transaction
  const result = await prisma.$transaction([
    // 1. Update the base AnimalType
    prisma.animalType.update({
      where: { id },
      data: {
        name: data.name,
        name_ar: data.name_ar,
        slug: finalSlug,
        description: data.description,
        description_ar: data.description_ar,
        category: data.category,
        category_ar: data.category_ar,
        productionSeason_ar: data.productionSeason_ar,
        metaTitle: data.metaTitle,
        metaTitle_ar: data.metaTitle_ar,
        products: data.productIds ? {
          set: data.productIds.map(id => ({ id }))
        } : undefined,
        imageUrl: data.imageUrl,
        icon: data.icon,
        pdfUrl: data.pdfUrl !== undefined ? (data.pdfUrl || null) : undefined,
        pdfUrl_ar: data.pdfUrl_ar !== undefined ? (data.pdfUrl_ar || null) : undefined,
        documentTitle: data.documentTitle !== undefined ? (data.documentTitle || null) : undefined,
        documentTitle_ar: data.documentTitle_ar !== undefined ? (data.documentTitle_ar || null) : undefined,
        order: data.order,
        isActive: data.isActive
      }
    }),

    // 2. Delete issues that were removed
    ...issuesToDelete.map(issueId => prisma.animalIssue.delete({ where: { id: issueId } })),

    ...(data.issues || []).map(i => i.id
      ? prisma.animalIssue.update({ where: { id: i.id }, data: { title: i.title, title_ar: i.title_ar, description: i.description, description_ar: i.description_ar, order: i.order, isActive: i.isActive, recommendation: i.recommendation ? i.recommendation : null } })
      : prisma.animalIssue.create({ data: { title: i.title, title_ar: i.title_ar, description: i.description, description_ar: i.description_ar, order: i.order, isActive: i.isActive, recommendation: i.recommendation ? i.recommendation : null, animalTypeId: id } })
    ),
  ]);

  revalidatePath("/admin/animal-types");
  revalidatePath("/products");
  revalidatePath("/ar/products");
  revalidatePath("/en/products");
  
  return result;
}

export async function listAnimalIssues(animalTypeId: string) {
  return prisma.animalIssue.findMany({
    where: { animalTypeId, isActive: true },
    orderBy: { order: 'asc' }
  });
}

export async function deleteAnimalType(id: string) {
  await prisma.animalType.delete({
    where: { id }
  });
  
  revalidatePath("/admin/animal-types");
  revalidatePath("/products");
  revalidatePath("/ar/products");
  revalidatePath("/en/products");
}
