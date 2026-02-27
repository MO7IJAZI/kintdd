import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const results = [];

    // 1. Create _CropRecommendedProducts table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`_CropRecommendedProducts\` (
            \`A\` VARCHAR(191) NOT NULL,
            \`B\` VARCHAR(191) NOT NULL,
            UNIQUE INDEX \`_CropRecommendedProducts_AB_unique\`(\`A\`, \`B\`),
            INDEX \`_CropRecommendedProducts_B_index\`(\`B\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created table _CropRecommendedProducts");
    } catch (e) {
      results.push(`Error creating table _CropRecommendedProducts: ${e}`);
    }

    // 2. Add Foreign Keys for _CropRecommendedProducts
    try {
      // Check if FK exists first to avoid error? MySQL doesn't have IF NOT EXISTS for constraints easily.
      // We'll wrap in try-catch.
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_CropRecommendedProducts\` ADD CONSTRAINT \`_CropRecommendedProducts_A_fkey\` FOREIGN KEY (\`A\`) REFERENCES \`crops\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      results.push("Added FK A for _CropRecommendedProducts");
    } catch (e) {
      results.push(`FK A for _CropRecommendedProducts might already exist or failed: ${e}`);
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_CropRecommendedProducts\` ADD CONSTRAINT \`_CropRecommendedProducts_B_fkey\` FOREIGN KEY (\`B\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      results.push("Added FK B for _CropRecommendedProducts");
    } catch (e) {
      results.push(`FK B for _CropRecommendedProducts might already exist or failed: ${e}`);
    }

    // 3. Create _AnimalTypeToProduct table (Implicit M-N)
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`_AnimalTypeToProduct\` (
            \`A\` VARCHAR(191) NOT NULL,
            \`B\` VARCHAR(191) NOT NULL,
            UNIQUE INDEX \`_AnimalTypeToProduct_AB_unique\`(\`A\`, \`B\`),
            INDEX \`_AnimalTypeToProduct_B_index\`(\`B\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created table _AnimalTypeToProduct");
    } catch (e) {
      results.push(`Error creating table _AnimalTypeToProduct: ${e}`);
    }

    // 4. Add Foreign Keys for _AnimalTypeToProduct
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_AnimalTypeToProduct\` ADD CONSTRAINT \`_AnimalTypeToProduct_A_fkey\` FOREIGN KEY (\`A\`) REFERENCES \`animal_types\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      results.push("Added FK A for _AnimalTypeToProduct");
    } catch (e) {
      results.push(`FK A for _AnimalTypeToProduct might already exist or failed: ${e}`);
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`_AnimalTypeToProduct\` ADD CONSTRAINT \`_AnimalTypeToProduct_B_fkey\` FOREIGN KEY (\`B\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      results.push("Added FK B for _AnimalTypeToProduct");
    } catch (e) {
      results.push(`FK B for _AnimalTypeToProduct might already exist or failed: ${e}`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Database fix failed:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}