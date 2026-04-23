const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting manual database fix...');

  try {
    // 1. Create _CropRecommendedProducts table
    console.log('Creating _CropRecommendedProducts table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`_croprecommendedproducts\` (
          \`A\` VARCHAR(191) NOT NULL,
          \`B\` VARCHAR(191) NOT NULL,
          UNIQUE INDEX \`_croprecommendedproducts_AB_unique\`(\`A\`, \`B\`),
          INDEX \`_croprecommendedproducts_B_index\`(\`B\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('✅ Created table _croprecommendedproducts');

    // 2. Add Foreign Keys for _croprecommendedproducts
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_croprecommendedproducts\` ADD CONSTRAINT \`_croprecommendedproducts_A_fkey\` FOREIGN KEY (\`A\`) REFERENCES \`crops\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Added FK A for _croprecommendedproducts');
    } catch (e) {
      console.log('ℹ️ FK A for _croprecommendedproducts might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_croprecommendedproducts\` ADD CONSTRAINT \`_croprecommendedproducts_B_fkey\` FOREIGN KEY (\`B\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Added FK B for _croprecommendedproducts');
    } catch (e) {
      console.log('ℹ️ FK B for _croprecommendedproducts might already exist');
    }

    // 3. Create _AnimalTypeToProduct table
    console.log('Creating _animaltypetoproduct table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`_animaltypetoproduct\` (
          \`A\` VARCHAR(191) NOT NULL,
          \`B\` VARCHAR(191) NOT NULL,
          UNIQUE INDEX \`_animaltypetoproduct_AB_unique\`(\`A\`, \`B\`),
          INDEX \`_animaltypetoproduct_B_index\`(\`B\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('✅ Created table _animaltypetoproduct');

    // 4. Add Foreign Keys for _animaltypetoproduct
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_animaltypetoproduct\` ADD CONSTRAINT \`_animaltypetoproduct_A_fkey\` FOREIGN KEY (\`A\`) REFERENCES \`animal_types\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Added FK A for _animaltypetoproduct');
    } catch (e) {
      console.log('ℹ️ FK A for _animaltypetoproduct might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_animaltypetoproduct\` ADD CONSTRAINT \`_animaltypetoproduct_B_fkey\` FOREIGN KEY (\`B\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Added FK B for _animaltypetoproduct');
    } catch (e) {
      console.log('ℹ️ FK B for _animaltypetoproduct might already exist');
    }

    console.log('Database fix completed successfully.');
  } catch (error) {
    console.error('Error executing database fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
