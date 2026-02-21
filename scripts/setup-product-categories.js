require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupProductCategories() {
  try {
    // Delete existing categories that might conflict
    await prisma.category.deleteMany({
      where: {
        OR: [
          { slug: 'livestock' },
          { slug: 'plant-wealth' },
          { slug: 'animal-products' },
          { slug: 'plant-products' },
        ]
      }
    });
    console.log('Cleared existing categories');

    // Create "livestock" parent category
    const livestock = await prisma.category.upsert({
      where: { slug: 'livestock' },
      update: {},
      create: {
        name: 'Livestock',
        name_ar: 'الثروة الحيوانية',
        slug: 'livestock',
        description: 'Animal health and nutrition products',
        description_ar: 'منتجات صحة وتغذية الحيوان',
        isActive: true,
        order: 1,
      },
    });
    console.log('Created Livestock category');

    // Create "animal-products" subcategory under livestock
    await prisma.category.upsert({
      where: { slug: 'animal-products' },
      update: {},
      create: {
        name: 'Animal Products',
        name_ar: 'المنتجات الحيوانية',
        slug: 'animal-products',
        description: 'Animal health and nutrition products',
        description_ar: 'منتجات صحة وتغذية الحيوان',
        parentId: livestock.id,
        isActive: true,
        order: 1,
      },
    });
    console.log('Created Animal Products subcategory');

    // Create "plant-wealth" parent category
    const plantWealth = await prisma.category.upsert({
      where: { slug: 'plant-wealth' },
      update: {},
      create: {
        name: 'Plant Wealth',
        name_ar: 'الثروة النباتية',
        slug: 'plant-wealth',
        description: 'Plant nutrition and protection products',
        description_ar: 'منتجات تغذية وحماية النبات',
        isActive: true,
        order: 2,
      },
    });
    console.log('Created Plant Wealth category');

    // Create "plant-products" subcategory under plant-wealth
    await prisma.category.upsert({
      where: { slug: 'plant-products' },
      update: {},
      create: {
        name: 'Plant Products',
        name_ar: 'المنتجات النباتية',
        slug: 'plant-products',
        description: 'Plant nutrition and protection products',
        description_ar: 'منتجات تغذية وحماية النبات',
        parentId: plantWealth.id,
        isActive: true,
        order: 1,
      },
    });
    console.log('Created Plant Products subcategory');

    console.log('✅ All product categories set up successfully');
    console.log('URLs:');
    console.log('  - /products/livestock/animal-products');
    console.log('  - /products/plant-wealth/plant-products');
  } catch (error) {
    console.error('Error setting up categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupProductCategories();
