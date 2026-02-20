import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.animalType.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { issues: true } } }
  });
  return NextResponse.json(items);
}
