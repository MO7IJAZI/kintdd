"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface AgentItem {
  id: string;
  name: string;
  name_ar?: string | null;
  logo: string;
  order: number;
  isActive: boolean;
}

const AGENTS_SETTING_KEY = "agents_logos";

const defaultAgents: AgentItem[] = [
  { id: "1", name: "Agent 1", logo: "/images/agents/company1.png", order: 0, isActive: true },
  { id: "2", name: "Agent 2", logo: "/images/agents/company2.png", order: 1, isActive: true },
  { id: "3", name: "Agent 3", logo: "/images/agents/company3.png", order: 2, isActive: true },
  { id: "4", name: "Agent 4", logo: "/images/agents/company4.png", order: 3, isActive: true },
  { id: "5", name: "Agent 5", logo: "/images/agents/company5.png", order: 4, isActive: true },
];

function normalizeAgents(input: unknown): AgentItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item, index) => {
      const row = item as Partial<AgentItem>;
      return {
        id: row.id?.toString() || `${Date.now()}-${index}`,
        name: row.name?.toString().trim() || `Agent ${index + 1}`,
        name_ar: row.name_ar?.toString().trim() || null,
        logo: row.logo?.toString().trim() || "",
        order: Number.isFinite(Number(row.order)) ? Number(row.order) : index,
        isActive: typeof row.isActive === "boolean" ? row.isActive : true,
      };
    })
    .filter((item) => item.logo.length > 0)
    .sort((a, b) => a.order - b.order);
}

export async function getAgents() {
  const setting = await prisma.setting.findUnique({
    where: { key: AGENTS_SETTING_KEY },
  });

  if (!setting?.value) {
    return defaultAgents;
  }

  try {
    const parsed = JSON.parse(setting.value);
    const normalized = normalizeAgents(parsed);
    return normalized.length > 0 ? normalized : defaultAgents;
  } catch {
    return defaultAgents;
  }
}

export async function saveAgents(agents: AgentItem[]) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const normalized = normalizeAgents(agents);

  await prisma.setting.upsert({
    where: { key: AGENTS_SETTING_KEY },
    update: { value: JSON.stringify(normalized) },
    create: { key: AGENTS_SETTING_KEY, value: JSON.stringify(normalized) },
  });

  revalidatePath("/");
  revalidatePath("/admin/agents");

  return normalized;
}
