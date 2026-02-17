import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting fresh seed...');

    // 1. Create Default Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@kint.com' },
        update: {},
        create: {
            email: 'admin@kint.com',
            password: hashedPassword,
            name: 'KINT Admin',
            role: 'super_admin',
        },
    });

    console.log('✅ Admin user ready:', admin.email);
    console.log('🚀 Database is ready for real data input.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
