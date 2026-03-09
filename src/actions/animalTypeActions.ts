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
      tabs: { 
        orderBy: { order: 'asc' },
        include: {
          images: { orderBy: { order: 'asc' } }
        }
      }
    }
  });
}


interface TabImageItem {
  id?: string;
  imageUrl: string;
  title?: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  order?: number;
}

interface TabItem {
  id?: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  order?: number;
  images?: TabImageItem[];
}

export async function createAnimalType(data: {
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  imageUrl?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  issues?: Array<{ title: string; title_ar?: string; description?: string; description_ar?: string; order?: number; isActive?: boolean }>;
  tabs?: TabItem[];
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
      imageUrl: data.imageUrl || null,
      icon: data.icon || null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
      issues: {
        create: (data.issues || []).map(i => ({
          title: i.title,
          title_ar: i.title_ar || null,
          description: i.description || null,
          description_ar: i.description_ar || null,
          order: i.order ?? 0,
          isActive: i.isActive ?? true
        }))
      },
      tabs: {
        create: (data.tabs || []).map(t => ({
          title: t.title,
          title_ar: t.title_ar || null,
          description: t.description || null,
          description_ar: t.description_ar || null,
          order: t.order ?? 0,
          images: {
            create: (t.images || []).map(img => ({
              imageUrl: img.imageUrl,
              title: img.title || null,
              title_ar: img.title_ar || null,
              description: img.description || null,
              description_ar: img.description_ar || null,
              order: img.order ?? 0,
            }))
          }
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
  order?: number;
  isActive?: boolean;
  issues?: Array<{ id?: string; title: string; title_ar?: string; description?: string; description_ar?: string; order?: number; isActive?: boolean }>;
  tabs?: TabItem[];
}) {
  // Fetch current state including relations to compare
  const current = await prisma.animalType.findUnique({
    where: { id },
    include: {
      issues: true,
      tabs: { include: { images: true } }
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

  // --- Tabs and Images ---
  const existingTabs = current.tabs;
  const existingTabIds = new Set(existingTabs.map(t => t.id));
  const incomingTabIds = new Set((data.tabs || []).map(t => t.id).filter((id): id is string => !!id));
  const tabsToDelete = [...existingTabIds].filter(x => !incomingTabIds.has(x));

  let imagesToDelete: string[] = [];
  existingTabs.forEach(existingTab => {
    const incomingTab = (data.tabs || []).find(t => t.id === existingTab.id);
    if (incomingTab) {
      const existingImageIds = new Set(existingTab.images.map(img => img.id));
      const incomingImageIds = new Set((incomingTab.images || []).map(img => img.id).filter((id): id is string => !!id));
      const tabImagesToDelete = [...existingImageIds].filter(x => !incomingImageIds.has(x));
      imagesToDelete.push(...tabImagesToDelete);
    }
  });

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
        imageUrl: data.imageUrl,
        icon: data.icon,
        order: data.order,
        isActive: data.isActive
      }
    }),

    // 2. Delete issues, tabs, and images that were removed
    ...issuesToDelete.map(issueId => prisma.animalIssue.delete({ where: { id: issueId } })),
    ...imagesToDelete.map(imgId => prisma.animalTypeTabImage.delete({ where: { id: imgId }})),
    ...tabsToDelete.map(tabId => prisma.animalTypeTab.delete({ where: { id: tabId } })),

    // 3. Upsert issues
    ...(data.issues || []).map(i => i.id
      ? prisma.animalIssue.update({ where: { id: i.id }, data: { title: i.title, title_ar: i.title_ar, description: i.description, description_ar: i.description_ar, order: i.order, isActive: i.isActive } })
      : prisma.animalIssue.create({ data: { title: i.title, title_ar: i.title_ar, description: i.description, description_ar: i.description_ar, order: i.order, isActive: i.isActive, animalTypeId: id } })
    ),

    // 4. Upsert tabs and their images
    ...(data.tabs || []).map((t: TabItem) => {
      const tabData = {
        title: t.title,
        title_ar: t.title_ar,
        description: t.description,
        description_ar: t.description_ar,
        order: t.order,
      };

      if (t.id) {
        // Update existing tab and its images
        return prisma.animalTypeTab.update({
          where: { id: t.id },
          data: {
            ...tabData,
            images: {
              upsert: (t.images || []).map((image: TabImageItem) => ({
                where: { id: image.id || '' },
                update: { imageUrl: image.imageUrl, title: image.title, title_ar: image.title_ar, description: image.description, description_ar: image.description_ar, order: image.order },
                create: { imageUrl: image.imageUrl, title: image.title, title_ar: image.title_ar, description: image.description, description_ar: image.description_ar, order: image.order },
              })) 
            }
          }
        });
      } else {
        // Create new tab and its images
        return prisma.animalTypeTab.create({
          data: {
            ...tabData,
            animalTypeId: id,
            images: {
              create: (t.images || []).map((image: TabImageItem) => ({
                imageUrl: image.imageUrl, title: image.title, title_ar: image.title_ar, description: image.description, description_ar: image.description_ar, order: image.order
              }))
            }
          }
        });
      }
    })
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
