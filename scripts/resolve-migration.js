const { execSync } = require('child_process');

try {
  console.log('Resolving failed migration...');
  // Mark the failed migration as rolled back so it can be re-applied (or marked applied if we fixed it)
  // Since we modified the migration file to be empty/safe, we want to mark it as rolled back so it tries again (and succeeds doing nothing)
  // OR we can mark it as applied if we manually fixed the DB.
  // Given the error was "failed to apply", and we modified the SQL to comment out the erroring parts,
  // we should mark it as rolled back so the next deploy tries to run the (now fixed) SQL.
  
  execSync('npx prisma migrate resolve --rolled-back 20260227145443_kintkint', { stdio: 'inherit' });
  console.log('Successfully resolved migration as rolled back.');
} catch (error) {
  console.error('Failed to resolve migration:', error.message);
  process.exit(1);
}
