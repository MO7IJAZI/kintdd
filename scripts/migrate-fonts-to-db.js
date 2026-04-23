/**
 * Migration script: Move fonts from JSON file to database
 * This script reads custom-fonts.json and inserts entries into the database
 * Usage: node scripts/migrate-fonts-to-db.js
 */

const fs = require('fs').promises;
const path = require('path');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateFontsToDatabase() {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'custom-fonts.json');
    
    // Check if JSON file exists
    console.log(`Checking for JSON file at: ${jsonPath}`);
    let jsonFonts = [];
    
    try {
      const data = await fs.readFile(jsonPath, 'utf-8');
      jsonFonts = JSON.parse(data);
      console.log(`✅ Found JSON file with ${jsonFonts.length} fonts`);
    } catch (error) {
      console.log('ℹ️  No JSON file found. This might be the first database migration.');
      jsonFonts = [];
    }

    if (jsonFonts.length === 0) {
      console.log('No fonts to migrate.');
      return;
    }

    // Migrate each font to database
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const font of jsonFonts) {
      try {
        // Check if font already exists in database
        const existing = await prisma.customFont.findUnique({
          where: { name: font.name },
        });

        if (existing) {
          console.log(`⏭️  Skipping "${font.name}" - already exists in database`);
          skipCount++;
          continue;
        }

        // Insert into database with default values for missing fields
        const ext = font.url.split('.').pop()?.toLowerCase();
        const mimeTypeMap = {
          'ttf': 'font/ttf',
          'otf': 'font/otf',
          'woff': 'font/woff',
          'woff2': 'font/woff2',
        };
        const mimeType = mimeTypeMap[ext] || 'font/ttf';

        await prisma.customFont.create({
          data: {
            name: font.name,
            url: font.url,
            fileName: font.name + '.' + ext, // Reconstruct filename
            fileSize: 0, // Unknown from JSON
            mimeType: mimeType,
            displayName: font.name,
            isActive: true,
          },
        });

        console.log(`✅ Migrated: "${font.name}"`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to migrate "${font.name}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ⏭️  Skipped: ${skipCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);

    if (errorCount === 0 && successCount > 0) {
      console.log('\n✨ All fonts successfully migrated to database!');
      console.log('You can safely delete public/custom-fonts.json if desired.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateFontsToDatabase();
