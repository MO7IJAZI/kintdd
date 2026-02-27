const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting manual database fix...');

  try {
    // 1. Create _CropRecommendedProducts table
    console.log('Creating _CropRecommendedProducts table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`_CropRecommendedProducts\` (
          \`A\` VARCHAR(191) NOT NULL,
          \`B\` VARCHAR(191) NOT NULL,
          UNIQUE INDEX \`_CropRecommendedProducts_AB_unique\`(\`A\`, \`B\`),
          INDEX \`_CropRecommendedProducts_B_index\`(\`B\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('✅ Created table _CropRecommendedProducts');

    // 2. Add Foreign Keys for _CropRecommendedProducts
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_CropRecommendedProducts\` ADD CONSTRAINT \`_CropRecommendedProducts_A_fkey\` FOREIGN KEY (\`A\`) REFERENCES \`crops\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Added FK A for _CropRecommendedProducts');
    } catch (e) {
      console.log('ℹ️ FK A for _CropRecommendedProducts might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_CropRecommendedProducts\` ADD CONSTRAINT \`_CropRecommendedProducts_B_fkey\` FOREIGN KEY (\`B\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Added FK B for _CropRecommendedProducts');
    } catch (e) {
      console.log('ℹ️ FK B for _CropRecommendedProducts might already exist');
    }

    // 3. Create _AnimalTypeToProduct table
    console.log('Creating _AnimalTypeToProduct table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`_AnimalTypeToProduct\` (
          \`A\` VARCHAR(191) NOT NULL,
          \`B\` VARCHAR(191) NOT NULL,
          UNIQUE INDEX \`_AnimalTypeToProduct_AB_unique\`(\`A\`, \`B\`),
          INDEX \`_AnimalTypeToProduct_B_index\`(\`B\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('✅ Created table _AnimalTypeToProduct');

    // 4. Add Foreign Keys for _AnimalTypeToProduct
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_AnimalTypeToProduct\` ADD CONSTRAINT \`_AnimalTypeToProduct_A_fkey\` FOREIGN KEY (\`A\`) REFERENCES \`animal_types\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Added FK A for _AnimalTypeToProduct');
    } catch (e) {
      console.log('ℹ️ FK A for _AnimalTypeToProduct might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_AnimalTypeToProduct\` ADD CONSTRAINT \`_AnimalTypeToProduct_B_fkey\` FOREIGN KEY (\`B\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Added FK B for _AnimalTypeToProduct');
    } catch (e) {
      console.log('ℹ️ FK B for _AnimalTypeToProduct might already exist');
    }

    console.log('Database fix completed successfully.');
  } catch (error) {
    console.error('Error executing database fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
