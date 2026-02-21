require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addProductCategories() {
  try {
    // Create Animal Production parent category
    const animalProduction = await prisma.category.upsert({
      where: { slug: 'animal-production' },
      update: {},
      create: {
        name: 'Animal Production',
        name_ar: 'الثروة الحيوانية',
        slug: 'animal-production',
        description: 'Veterinary products and animal nutrition solutions',
        description_ar: 'منتجات الثروة الحيوانية وحلول تغذية الحيوان',
        isActive: true,
        order: 1,
      },
    });
    console.log('Created Animal Production category');

    // Create Animal Products subcategory
    await prisma.category.upsert({
      where: { slug: 'animal-products' },
      update: {},
      create: {
        name: 'Animal Products',
        name_ar: 'المنتجات الحيوانية',
        slug: 'animal-products',
        description: 'General animal health and nutrition products',
        description_ar: 'منتجات عامة لصحة وتغذية الحيوان',
        parentId: animalProduction.id,
        isActive: true,
        order: 1,
      },
    });
    console.log('Created Animal Products subcategory');

    // Create Plant Production parent category
    const plantProduction = await prisma.category.upsert({
      where: { slug: 'plant-production' },
      update: {},
      create: {
        name: 'Plant Production',
        name_ar: 'الثروة النباتية',
        slug: 'plant-production',
        description: 'Agricultural products for crop nutrition and protection',
        description_ar: 'منتجات الثروة النباتية لتغذية وحماية المحاصيل',
        isActive: true,
        order: 2,
      },
    });
    console.log('Created Plant Production category');

    // Create Plant Products subcategory
    await prisma.category.upsert({
      where: { slug: 'plant-products' },
      update: {},
      create: {
        name: 'Plant Products',
        name_ar: 'المنتجات النباتية',
        slug: 'plant-products',
        description: 'Products for general plant care and fertilization',
        description_ar: 'منتجات للعناية العامة بالنبات والتسميد',
        parentId: plantProduction.id,
        isActive: true,
        order: 1,
      },
    });
    console.log('Created Plant Products subcategory');

    console.log('✅ All product categories created successfully');
  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductCategories();
