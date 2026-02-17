"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function submitInquiry(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    await prisma.contactSubmission.create({
        data: {
            name,
            email,
            phone,
            subject,
            message,
        },
    });

    revalidatePath("/admin/inquiries");
    revalidateTag("inquiries", { expire: 0 });
    return { success: true, message: "Your message has been sent successfully!" };
}

const getInquiriesCached = unstable_cache(
    async () =>
        prisma.contactSubmission.findMany({
            orderBy: { createdAt: "desc" },
        }),
    ["inquiries:list"],
    { revalidate: 10, tags: ["inquiries"] }
);

export async function getInquiries() {
    return getInquiriesCached();
}

export async function markAsRead(id: string) {
    await prisma.contactSubmission.update({
        where: { id },
        data: { isRead: true },
    });
    revalidatePath("/admin/inquiries");
    revalidateTag("inquiries", { expire: 0 });
}

export async function deleteInquiry(id: string) {
    await prisma.contactSubmission.delete({
        where: { id },
    });
    revalidatePath("/admin/inquiries");
    revalidateTag("inquiries", { expire: 0 });
}
