import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { PassThrough, Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toFilenameTimestamp(date: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(
        date.getMinutes()
    )}-${pad(date.getSeconds())}`;
}

function assertSafeIdentifier(value: string, kind: "table" | "column") {
    if (!/^[A-Za-z0-9_]+$/.test(value)) {
        throw new Error(`Unsafe ${kind} identifier: ${value}`);
    }
}

async function exportDatabase() {
    const tableRows = await prisma.$queryRaw<{ tableName: string }[]>(
        Prisma.sql`SELECT table_name AS tableName
                   FROM information_schema.tables
                   WHERE table_schema = DATABASE()
                     AND table_type = 'BASE TABLE'`
    );

    const tables = tableRows
        .map((r) => r.tableName)
        .filter((name) => name && name !== "_prisma_migrations")
        .sort();

    const data: Record<string, unknown[]> = {};

    for (const table of tables) {
        assertSafeIdentifier(table, "table");
        const rows = (await prisma.$queryRawUnsafe(`SELECT * FROM \`${table}\``)) as unknown[];
        data[table] = rows;
    }

    return {
        provider: "mysql",
        tables: data,
    };
}

export async function GET() {
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
        });
    }

    const createdAt = new Date();
    const filename = `kint-backup-${toFilenameTimestamp(createdAt)}.zip`;

    const db = await exportDatabase();
    const manifest = {
        version: 2,
        createdAt: createdAt.toISOString(),
        type: "kint-full-backup",
        includes: ["manifest.json", "db.json", "public/**"],
    };

    const passThrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
        passThrough.destroy(err);
    });

    archive.pipe(passThrough);
    archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });
    archive.append(JSON.stringify(db), { name: "db.json" });

    const publicDir = path.join(process.cwd(), "public");
    if (fs.existsSync(publicDir)) {
        archive.directory(publicDir, "public");
    }

    void archive.finalize();

    const body = Readable.toWeb(passThrough as unknown as Readable) as unknown as ReadableStream;
    return new Response(body, {
        headers: {
            "content-type": "application/zip",
            "content-disposition": `attachment; filename="${filename}"`,
            "cache-control": "no-store, max-age=0",
        },
    });
}
