require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const crop = await prisma.crop.upsert({
    where: { slug: 'cucumber-1' },
    update: {},
    create: {
      name: 'Cucumber',
      slug: 'cucumber-1',
      description: 'Cucumber description',
      category: 'vegetables',
      stages: {
        create: [
          {
            name: 'Stage 1',
            order: 1,
            recommendation: { products: [] }
          }
        ]
      }
    }
  });
  console.log('Created crop:', crop);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });