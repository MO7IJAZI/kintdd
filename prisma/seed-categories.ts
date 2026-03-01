import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    console.log('Clearing existing categories...');
    // Clear existing categories
    // Note: We need to delete child categories first due to foreign key constraints if cascading is not set up
    await prisma.product.deleteMany({}); // Delete products first as they depend on categories
    await prisma.category.deleteMany({});
    console.log('Cleared existing categories');

    // Create main categories
    console.log('Creating parent categories...');
    
    // 1. Livestock (Animal Wealth)
    const livestock = await prisma.category.create({
      data: {
        name: 'Livestock',
        name_ar: 'الثروة الحيوانية',
        slug: 'livestock',
        description: 'Comprehensive solutions for livestock health and productivity',
        description_ar: 'حلول شاملة لصحة وإنتاجية الثروة الحيوانية',
        isActive: true,
        order: 1,
        image: '/images/categories/livestock.jpg' // Placeholder
      },
    });

    // 2. Plant Wealth
    const plantWealth = await prisma.category.create({
      data: {
        name: 'Plant Wealth',
        name_ar: 'الثروة النباتية',
        slug: 'plant-wealth',
        description: 'Advanced agricultural products for optimal crop yield',
        description_ar: 'منتجات زراعية متقدمة للحصول على أفضل إنتاجية للمحاصيل',
        isActive: true,
        order: 2,
        image: '/images/categories/plant-wealth.jpg' // Placeholder
      },
    });

    console.log('Creating subcategories...');

    // Create sub-categories under Livestock
    await prisma.category.create({
      data: {
        name: 'Animal Products',
        name_ar: 'المنتجات الحيوانية',
        slug: 'animal-products',
        description: 'High-quality feed additives and veterinary products',
        description_ar: 'إضافات أعلاف ومنتجات بيطرية عالية الجودة',
        parentId: livestock.id,
        isActive: true,
        order: 1,
      },
    });

    // Create sub-categories under Plant Wealth
    await prisma.category.create({
      data: {
        name: 'Plant Products',
        name_ar: 'المنتجات النباتية',
        slug: 'plant-products',
        description: 'Fertilizers, biostimulants, and protection solutions',
        description_ar: 'أسمدة ومحفزات حيوية وحلول حماية',
        parentId: plantWealth.id,
        isActive: true,
        order: 1,
      },
    });

    console.log('✅ Categories seeded successfully');
    
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
