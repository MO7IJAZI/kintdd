const { exec } = require('child_process');

console.log('Resolving failed migration...');

// We need to mark the failed migration as rolled back or resolved because the database state 
// is inconsistent with what Prisma expects. Since we manually fixed the DB tables with fix-db,
// we can tell Prisma to ignore this specific migration error.

const MIGRATION_NAME = "20260227214622_create_crop_recommended_products_table";

console.log(`Marking migration ${MIGRATION_NAME} as resolved...`);

exec(`npx prisma migrate resolve --applied ${MIGRATION_NAME}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error resolving migration: ${error.message}`);
        console.log('Trying fallback: marking as rolled back...');
        
        exec(`npx prisma migrate resolve --rolled-back ${MIGRATION_NAME}`, (err2, out2, err2_stderr) => {
             if (err2) {
                 console.error(`Failed to resolve migration: ${err2.message}`);
             } else {
                 console.log('Successfully marked migration as rolled back.');
                 console.log(out2);
             }
        });
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(`Success! Migration resolved.`);
    console.log(stdout);
});
