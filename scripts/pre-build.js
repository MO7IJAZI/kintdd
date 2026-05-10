const fs = require('fs');
const path = require('path');

const publicImagesSrc = path.join(process.cwd(), 'public', 'images');
const tempImagesDest = path.join(process.cwd(), 'temp_public_images_backup');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Starting pre-build: Backing up public/images...');

try {
    if (fs.existsSync(publicImagesSrc)) {
        // Clear previous backup if it exists
        if (fs.existsSync(tempImagesDest)) {
            fs.rmSync(tempImagesDest, { recursive: true, force: true });
        }
        copyDir(publicImagesSrc, tempImagesDest);
        console.log('public/images backed up to temp_public_images_backup successfully.');
    } else {
        console.log('public/images directory not found. No backup needed.');
    }
} catch (error) {
    console.error('Error during pre-build backup:', error);
    process.exit(1);
}
