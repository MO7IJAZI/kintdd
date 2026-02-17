'use server';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { uploadFile } from '../lib/upload';

type DocumentRecord = {
    id: string;
    title: string;
    title_ar: string | null;
    slug: string;
    description: string | null;
    description_ar: string | null;
    filePath: string;
    category: string;
    isActive: boolean;
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
};

type PrismaDocumentDelegate = {
    create: (args: unknown) => Promise<DocumentRecord>;
    update: (args: unknown) => Promise<DocumentRecord>;
    delete: (args: unknown) => Promise<DocumentRecord>;
    findMany: (args: unknown) => Promise<DocumentRecord[]>;
    findFirst: (args: unknown) => Promise<DocumentRecord | null>;
};

const prismaDocument = (prisma as unknown as { document: PrismaDocumentDelegate }).document;

export interface DocumentInput {
    title: string;
    title_ar?: string;
    description?: string;
    description_ar?: string;
    category: string;
    file: File;
}

export async function createDocument(formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const title_ar = formData.get('title_ar') as string;
        const description = formData.get('description') as string;
        const description_ar = formData.get('description_ar') as string;
        const category = formData.get('category') as string;
        const file = formData.get('file') as File;

        if (!title || !category || !file) {
            throw new Error('Title, category, and file are required');
        }

        // Upload file
        const filePath = await uploadFile(file, 'documents');

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Create document
        await prismaDocument.create({
            data: {
                title,
                title_ar: title_ar || null,
                description: description || null,
                description_ar: description_ar || null,
                slug,
                filePath,
                category,
            }
        });

        revalidatePath('/admin/documents');
        if (category === 'mixing-table') {
            revalidatePath('/[locale]/mixing-table', 'page');
        }
        if (category === 'optimum-conditions') {
            revalidatePath('/[locale]/treatment-efficacy/optimum-conditions', 'page');
        }
        revalidateTag('documents', { expire: 0 });
        return { success: true };
    } catch (error) {
        console.error('Error creating document:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function updateDocument(id: string, formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const title_ar = formData.get('title_ar') as string;
        const description = formData.get('description') as string;
        const description_ar = formData.get('description_ar') as string;
        const category = formData.get('category') as string;
        const file = formData.get('file') as File;

        if (!title || !category) {
            throw new Error('Title and category are required');
        }

        const data: {
            title: string;
            title_ar: string | null;
            description: string | null;
            description_ar: string | null;
            category: string;
            filePath?: string;
        } = {
            title,
            title_ar: title_ar || null,
            description: description || null,
            description_ar: description_ar || null,
            category,
        };

        // If new file is uploaded
        if (file && file.size > 0) {
            const filePath = await uploadFile(file, 'documents');
            data.filePath = filePath;
        }

        // Update document
        await prismaDocument.update({
            where: { id },
            data
        });

        revalidatePath('/admin/documents');
        if (category === 'mixing-table') {
            revalidatePath('/[locale]/mixing-table', 'page');
        }
        if (category === 'optimum-conditions') {
            revalidatePath('/[locale]/treatment-efficacy/optimum-conditions', 'page');
        }
        revalidateTag('documents', { expire: 0 });
        return { success: true };
    } catch (error) {
        console.error('Error updating document:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function deleteDocument(id: string) {
    try {
        await prismaDocument.delete({
            where: { id }
        });

        revalidatePath('/admin/documents');
        revalidateTag('documents', { expire: 0 });
        return { success: true };
    } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

const getDocumentsCached = unstable_cache(
    async (category?: string) => {
        const where = category ? { category, isActive: true } : { isActive: true };
        return prismaDocument.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
    },
    ['documents:list'],
    { revalidate: 10, tags: ['documents'] }
);

const getDocumentByIdCached = unstable_cache(
    async (id: string) =>
        prismaDocument.findFirst({
            where: { id }
        }),
    ['documents:by-id'],
    { revalidate: 10, tags: ['documents'] }
);

const getDocumentBySlugCached = unstable_cache(
    async (slug: string) =>
        prismaDocument.findFirst({
            where: { slug, isActive: true }
        }),
    ['documents:by-slug'],
    { revalidate: 10, tags: ['documents'] }
);

export async function getDocuments(category?: string) {
    try {
        const documents = await getDocumentsCached(category);

        return { success: true, data: documents };
    } catch (error) {
        console.error('Error getting documents:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function getDocumentById(id: string) {
    try {
        const document = await getDocumentByIdCached(id);

        return { success: true, data: document };
    } catch (error) {
        console.error('Error getting document:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function getDocumentBySlug(slug: string) {
    try {
        const document = await getDocumentBySlugCached(slug);

        return { success: true, data: document };
    } catch (error) {
        console.error('Error getting document:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function incrementDocumentDownloads(id: string) {
    try {
        await prismaDocument.update({
            where: { id },
            data: { downloads: { increment: 1 } }
        });

        return { success: true };
    } catch (error) {
        console.error('Error incrementing downloads:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
