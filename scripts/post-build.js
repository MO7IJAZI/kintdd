const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    
    // Create dest folder if it doesn't exist
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

console.log('Starting post-build asset copy...');

const standaloneDir = path.join(process.cwd(), '.next', 'standalone');
const staticSrc = path.join(process.cwd(), '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(process.cwd(), 'public');
const publicDest = path.join(standaloneDir, 'public');

try {
    // Copy .next/static
    if (fs.existsSync(staticSrc)) {
        console.log('Copying .next/static...');
        copyDir(staticSrc, staticDest);
    } else {
        console.warn('Warning: .next/static not found!');
    }

    // Copy public
    if (fs.existsSync(publicSrc)) {
        console.log('Copying public folder...');
        copyDir(publicSrc, publicDest);
    } else {
        console.warn('Warning: public folder not found!');
    }
    
    console.log('Post-build copy completed successfully.');

    // Restore backed-up public/images
    const tempImagesSrc = path.join(process.cwd(), 'temp_public_images_backup');
    const standalonePublicImagesDest = path.join(standaloneDir, 'public', 'images');

    if (fs.existsSync(tempImagesSrc)) {
        console.log('Restoring public/images from backup...');
        // Ensure the destination directory exists
        if (!fs.existsSync(standalonePublicImagesDest)) {
            fs.mkdirSync(standalonePublicImagesDest, { recursive: true });
        }
        copyDir(tempImagesSrc, standalonePublicImagesDest);
        console.log('public/images restored successfully.');
        // Clean up backup
        fs.rmSync(tempImagesSrc, { recursive: true, force: true });
        console.log('Temporary backup cleaned up.');
    } else {
        console.log('No public/images backup found to restore.');
    }

} catch (error) {
    console.error('Error during post-build copy or restore:', error);
    process.exit(1);
}
