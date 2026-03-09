import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    console.log('Ensuring default categories exist...');

    const ensureCategory = async (data: {
      name: string;
      name_ar: string;
      slug: string;
      description?: string | null;
      description_ar?: string | null;
      isActive?: boolean;
      order?: number;
      image?: string | null;
      parentId?: string | null;
    }) => {
      return prisma.category.upsert({
        where: { slug: data.slug },
        update: {
          name: data.name,
          name_ar: data.name_ar,
          description: data.description || null,
          description_ar: data.description_ar || null,
          isActive: data.isActive ?? true,
          order: data.order ?? 0,
          image: data.image || null,
          parentId: data.parentId || null,
        },
        create: {
          ...data,
          isActive: data.isActive ?? true,
          order: data.order ?? 0,
        },
      });
    };

    // Create main categories
    console.log('Creating parent categories...');
    
    // 1. Livestock (Animal Wealth)
    const livestock = await ensureCategory({
      name: 'Livestock',
      name_ar: 'الثروة الحيوانية',
      slug: 'livestock',
      description: 'Comprehensive solutions for livestock health and productivity',
      description_ar: 'حلول شاملة لصحة وإنتاجية الثروة الحيوانية',
      isActive: true,
      order: 1,
      image: '/images/categories/livestock.jpg'
    });

    // 2. Plant Wealth
    const plantWealth = await ensureCategory({
      name: 'Plant Wealth',
      name_ar: 'الثروة النباتية',
      slug: 'plant-wealth',
      description: 'Advanced agricultural products for optimal crop yield',
      description_ar: 'منتجات زراعية متقدمة للحصول على أفضل إنتاجية للمحاصيل',
      isActive: true,
      order: 2,
      image: '/images/categories/plant-wealth.jpg'
    });

    console.log('Creating subcategories...');

    // Create sub-categories under Livestock
    await ensureCategory({
      name: 'Animal Products',
      name_ar: 'المنتجات الحيوانية',
      slug: 'animal-products',
      description: 'High-quality feed additives and veterinary products',
      description_ar: 'إضافات أعلاف ومنتجات بيطرية عالية الجودة',
      parentId: livestock.id,
      isActive: true,
      order: 1,
    });

    await ensureCategory({
      name: 'By Animal Type',
      name_ar: 'حسب نوع الحيوان',
      slug: 'by-animal-type',
      description: 'Products categorized by animal type',
      description_ar: 'منتجات مصنفة حسب نوع الحيوان',
      parentId: livestock.id,
      isActive: true,
      order: 2,
    });

    // Create sub-categories under Plant Wealth
    await ensureCategory({
      name: 'Plant Products',
      name_ar: 'المنتجات النباتية',
      slug: 'plant-products',
      description: 'Fertilizers, biostimulants, and protection solutions',
      description_ar: 'أسمدة ومحفزات حيوية وحلول حماية',
      parentId: plantWealth.id,
      isActive: true,
      order: 1,
    });

    await ensureCategory({
      name: 'Crops',
      name_ar: 'المحاصيل',
      slug: 'crops',
      description: 'Specialized crop-specific solutions',
      description_ar: 'حلول متخصصة خاصة بالمحاصيل',
      parentId: plantWealth.id,
      isActive: true,
      order: 2,
    });

    console.log('✅ Categories ensured successfully');
    
    // Verify
    const all = await prisma.category.findMany({ select: { slug: true, parent: { select: { slug: true } } } });
    console.log('Current Categories:', JSON.stringify(all, null, 2));

  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
