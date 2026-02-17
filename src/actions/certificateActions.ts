'use server';

import prisma from '@/lib/prisma';

export async function getCertificates() {
    return prisma.certificate.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
    });
}

export async function getAllCertificates() {
    return prisma.certificate.findMany({
        orderBy: { order: 'asc' },
    });
}

export async function getCertificateById(id: string) {
    return prisma.certificate.findUnique({
        where: { id },
    });
}

export async function createCertificate(data: {
    title: string;
    description?: string;
    imageUrl: string;
    order?: number;
}) {
    return prisma.certificate.create({
        data,
    });
}

export async function updateCertificate(id: string, data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    order?: number;
    isActive?: boolean;
}) {
    return prisma.certificate.update({
        where: { id },
        data,
    });
}

export async function deleteCertificate(id: string) {
    return prisma.certificate.delete({
        where: { id },
    });
}
