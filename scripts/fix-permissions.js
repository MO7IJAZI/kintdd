const fs = require('fs');
const path = require('path');

// Only run on non-Windows platforms (like Linux on Hostinger)
if (process.platform === 'win32') {
  console.log('Windows detected, skipping permission fix.');
  process.exit(0);
}

const enginesDir = path.join(process.cwd(), 'node_modules', '@prisma', 'engines');

if (fs.existsSync(enginesDir)) {
  console.log(`Fixing permissions for Prisma engines in: ${enginesDir}`);
  try {
    const files = fs.readdirSync(enginesDir);
    let count = 0;
    for (const file of files) {
      const filePath = path.join(enginesDir, file);
      const stats = fs.statSync(filePath);
      // chmod +x (755) for files
      if (stats.isFile()) {
        fs.chmodSync(filePath, 0o755);
        count++;
        console.log(`Granted +x to ${file}`);
      }
    }
    console.log(`Successfully set executable permissions for ${count} files.`);
  } catch (error) {
    console.error('Failed to set permissions:', error);
    process.exit(1);
  }
} else {
  console.warn('Prisma engines directory not found. Skipping permission fix.');
}
