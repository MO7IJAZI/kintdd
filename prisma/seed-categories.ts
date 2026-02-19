import prisma from '../src/lib/prisma';

async function seedCategories() {
  try {
    // Clear existing categories
    await prisma.category.deleteMany({});
    console.log('Cleared existing categories');

    // Create main categories
    const animalProduction = await prisma.category.create({
      data: {
        name: 'Animal Production',
        name_ar: 'الثروة الحيوانية',
        slug: 'animal-production',
        description: 'Veterinary products and animal nutrition solutions',
        description_ar: 'منتجات الثروة الحيوانية وحلول تغذية الحيوان',
        isActive: true,
        order: 1,
      },
    });

    const plantProduction = await prisma.category.create({
      data: {
        name: 'Plant Production',
        name_ar: 'الثروة النباتية',
        slug: 'plant-production',
        description: 'Agricultural products for crop nutrition and protection',
        description_ar: 'منتجات الثروة النباتية لتغذية وحماية المحاصيل',
        isActive: true,
        order: 2,
      },
    });

    // Create sub-categories under Animal Production
    await prisma.category.create({
      data: {
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

    await prisma.category.create({
      data: {
        name: 'By Animal Type',
        name_ar: 'حسب نوع الحيوان',
        slug: 'by-animal-type',
        description: 'Products categorized by animal type',
        description_ar: 'منتجات مصنفة حسب نوع الحيوان',
        parentId: animalProduction.id,
        isActive: true,
        order: 2,
      },
    });

    // Create sub-categories under Plant Production
    await prisma.category.create({
      data: {
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

    await prisma.category.create({
      data: {
        name: 'Crops',
        name_ar: 'المحاصيل',
        slug: 'crops',
        description: 'Specialized crop-specific solutions',
        description_ar: 'حلول متخصصة خاصة بالمحاصيل',
        parentId: plantProduction.id,
        isActive: true,
        order: 2,
      },
    });

    console.log('✅ Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
