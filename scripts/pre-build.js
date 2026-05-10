const fs = require('fs');
const path = require('path');

const publicImagesSrc = path.join(process.cwd(), 'public', 'images');
const publicDocumentsSrc = path.join(process.cwd(), 'public', 'documents');
const publicFontsSrc = path.join(process.cwd(), 'public', 'fonts');
const publicUploadsSrc = path.join(process.cwd(), 'public', 'uploads');
const tempBackupDir = path.join(process.cwd(), 'temp_public_backup');

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

console.log('Starting pre-build: Backing up public assets...');

try {
    // Clear previous backup if it exists
    if (fs.existsSync(tempBackupDir)) {
        fs.rmSync(tempBackupDir, { recursive: true, force: true });
        console.log('Cleared previous backup directory.');
    }

    const directoriesToBackup = [
        { src: publicImagesSrc, name: 'images' },
        { src: publicDocumentsSrc, name: 'documents' },
        { src: publicFontsSrc, name: 'fonts' },
        { src: publicUploadsSrc, name: 'uploads' },
    ];

    for (const dir of directoriesToBackup) {
        if (fs.existsSync(dir.src)) {
            const destPath = path.join(tempBackupDir, dir.name);
            copyDir(dir.src, destPath);
            console.log(`public/${dir.name} backed up to ${destPath} successfully.`);
        } else {
            console.log(`public/${dir.name} directory not found. No backup needed.`);
        }
    }
} catch (error) {
    console.error('Error during pre-build backup:', error);
    process.exit(1);
}
