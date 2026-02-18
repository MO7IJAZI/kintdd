const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@kint.com" },
    update: {},
    create: {
      email: "admin@kint.com",
      password: hashedPassword,
      name: "KINT Admin",
      role: "super_admin",
    },
  });

  console.log("Seed completed:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

