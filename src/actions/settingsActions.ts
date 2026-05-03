"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type GlobalSettings = {
  siteName: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
};

const SETTINGS_KEYS = {
  siteName: "site_name",
  contactEmail: "contact_email",
  facebookUrl: "facebook_url",
  instagramUrl: "instagram_url",
} as const;

const DEFAULT_SETTINGS: GlobalSettings = {
  siteName: "KINT Group",
  contactEmail: "info@kint-group.com",
  facebookUrl: "https://www.facebook.com/share/1Aa6zbV7A2/",
  instagramUrl: "https://www.instagram.com/kafri.international?igsh=MTZxdjNtYTNkemFncQ==",
};

function normalizeValue(value: string | null | undefined, fallback: string) {
  return value?.toString().trim() || fallback;
}

export async function getSettings(): Promise<GlobalSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.values(SETTINGS_KEYS) } },
  });

  const values = rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return {
    siteName: normalizeValue(values[SETTINGS_KEYS.siteName], DEFAULT_SETTINGS.siteName),
    contactEmail: normalizeValue(values[SETTINGS_KEYS.contactEmail], DEFAULT_SETTINGS.contactEmail),
    facebookUrl: normalizeValue(values[SETTINGS_KEYS.facebookUrl], DEFAULT_SETTINGS.facebookUrl),
    instagramUrl: normalizeValue(values[SETTINGS_KEYS.instagramUrl], DEFAULT_SETTINGS.instagramUrl),
  };
}

export async function saveSettings(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const siteName = normalizeValue(formData.get("siteName") as string, DEFAULT_SETTINGS.siteName);
  const contactEmail = normalizeValue(formData.get("contactEmail") as string, DEFAULT_SETTINGS.contactEmail);
  const facebookUrl = normalizeValue(formData.get("facebookUrl") as string, DEFAULT_SETTINGS.facebookUrl);
  const instagramUrl = normalizeValue(formData.get("instagramUrl") as string, DEFAULT_SETTINGS.instagramUrl);

  const settings = [
    { key: SETTINGS_KEYS.siteName, value: siteName },
    { key: SETTINGS_KEYS.contactEmail, value: contactEmail },
    { key: SETTINGS_KEYS.facebookUrl, value: facebookUrl },
    { key: SETTINGS_KEYS.instagramUrl, value: instagramUrl },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
}
