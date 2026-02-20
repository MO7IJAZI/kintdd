import prisma from "@/lib/prisma";

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
  issues?: Array<{ title: string; title_ar?: string; description?: string; description_ar?: string; order?: number; isActive?: boolean }>;
  tabs?: TabItem[];
}) {
  return prisma.animalType.create({
    data: {
      name: data.name,
      name_ar: data.name_ar || null,
      slug: data.slug,
      description: data.description || null,
      description_ar: data.description_ar || null,
      imageUrl: data.imageUrl || null,
      icon: data.icon || null,
      order: data.order ?? 0,
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
  // --- Issues --- 
  const existingIssues = await prisma.animalIssue.findMany({ where: { animalTypeId: id } });
  const existingIssueIds = new Set(existingIssues.map(e => e.id));
  const incomingIssueIds = new Set((data.issues || []).map(i => i.id).filter((id): id is string => !!id));
  const issuesToDelete = [...existingIssueIds].filter(x => !incomingIssueIds.has(x));

  // --- Tabs and Images ---
  const existingTabs = await prisma.animalTypeTab.findMany({ 
    where: { animalTypeId: id },
    include: { images: true }
  });
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
  return prisma.$transaction([
    // 1. Update the base AnimalType
    prisma.animalType.update({
      where: { id },
      data: {
        name: data.name,
        name_ar: data.name_ar,
        slug: data.slug,
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
}

export async function listAnimalIssues(animalTypeId: string) {
  return prisma.animalIssue.findMany({
    where: { animalTypeId, isActive: true },
    orderBy: { order: 'asc' }
  });
}
