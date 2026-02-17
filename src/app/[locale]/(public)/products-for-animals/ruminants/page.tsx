import prisma from "@/lib/prisma";
import Image from "next/image";
import { Link } from "@/navigation";
import { getTranslations, getLocale } from "next-intl/server";

export const revalidate = 300;

async function getDescendantCategoryIds(rootSlug: string) {
  const root = await prisma.category.findUnique({
    where: { slug: rootSlug },
    select: { id: true },
  });

  if (!root) return [];

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, parentId: true },
  });

  const ids = new Set<string>([root.id]);
  let added = true;

  while (added) {
    added = false;
    for (const c of categories) {
      if (!c.parentId) continue;
      if (!ids.has(c.parentId)) continue;
      if (ids.has(c.id)) continue;
      ids.add(c.id);
      added = true;
    }
  }

  return Array.from(ids);
}

export default async function RuminantsPage() {
  const t = await getTranslations("ProductsForAnimals");
  const tProduct = await getTranslations("Product");
  const tNav = await getTranslations("Navigation");
  const locale = await getLocale();
  const isAr = locale === "ar";

  const categoryIds = await getDescendantCategoryIds("ruminants");
  const products = categoryIds.length
    ? await prisma.product.findMany({
        where: { isActive: true, categoryId: { in: categoryIds } },
        include: { category: true },
        orderBy: { order: "asc" },
      })
    : [];

  return (
    <div className="section" dir={isAr ? "rtl" : "ltr"}>
      <div className="container">
        <div style={{ maxWidth: "900px", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--primary)" }}>
            {t("ruminants.title")}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--muted-foreground)", lineHeight: "1.7" }}>
            {t("ruminants.description")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
          {products.map((product: any) => {
            const pName = isAr && product.name_ar ? product.name_ar : product.name;
            const pShortDesc = isAr && product.shortDesc_ar ? product.shortDesc_ar : product.shortDesc;
            const pDesc = isAr && product.description_ar ? product.description_ar : product.description;
            const catName = isAr && product.category?.name_ar ? product.category?.name_ar : product.category?.name;

            return (
              <Link key={product.id} href={`/product/${product.slug}`} className="card">
                <div style={{ position: "relative", height: "200px", backgroundColor: "#fff" }}>
                  <Image
                    src={product.image || "/images/cat-biostimulants.png"}
                    alt={pName}
                    fill
                    style={{ objectFit: "contain", padding: "1rem" }}
                  />
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <span
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "white",
                      fontSize: "0.7rem",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "1rem",
                      textTransform: "uppercase",
                      fontWeight: "700",
                      display: "inline-block",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {catName || "Category"}
                  </span>
                  <h3 style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}>{pName}</h3>
                  <p
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: "0.875rem",
                      marginBottom: "1.5rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {pShortDesc || (pDesc ? pDesc.replace(/<[^>]*>?/gm, "").substring(0, 80) + "..." : "")}
                  </p>
                  <div style={{ color: "var(--primary)", fontWeight: "700", fontSize: "0.9rem" }}>
                    {tNav("viewDetails")} {isAr ? "←" : "→"}
                  </div>
                </div>
              </Link>
            );
          })}

          {products.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "5rem 0", textAlign: "center", color: "var(--muted-foreground)" }}>
              {tProduct("noProducts")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
