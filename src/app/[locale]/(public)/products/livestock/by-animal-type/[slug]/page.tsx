import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import { getLocale } from "next-intl/server";
import { stripScripts } from "@/lib/sanitizeHtml"; // Add this
import { Plus, Minus } from "lucide-react"; // Add this

// Add Accordion Component
function AccordionSection({ 
  title, 
  content, 
  images, 
  isAr 
}: { 
  title: string, 
  content?: string | null, 
  images: any[], 
  isAr: boolean 
}) {
  return (
    <details className="group" style={{ 
      border: "1px solid #e2e8f0", 
      borderRadius: "14px", 
      overflow: "hidden", 
      background: "#f8fafc",
      marginBottom: "1rem"
    }}>
      <summary style={{ 
        padding: "1rem 1.25rem", 
        background: "white", 
        borderBottom: "1px solid #e2e8f0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        listStyle: "none"
      }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#142346", fontWeight: 800 }}>{title}</h3>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: "#f1f5f9",
          color: "#64748b",
          transition: "all 0.3s ease"
        }}>
          <span className="group-open:hidden"><Plus size={18} /></span>
          <span className="hidden group-open:block"><Minus size={18} /></span>
        </div>
      </summary>
      
      <div style={{ padding: "1.25rem", background: "white" }}>
        {content && (
          <div 
            style={{ color: "#64748b", lineHeight: 1.7, marginBottom: images.length > 0 ? "1.5rem" : 0 }}
            dangerouslySetInnerHTML={{ __html: stripScripts(content) }}
            className="prose max-w-none"
          />
        )}
        
        {images.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
            {images.map((img: any) => {
              const imgTitle = isAr ? img.title_ar || img.title : img.title;
              return (
                <div key={img.id} className="card" style={{ overflow: "hidden" }}>
                  <div style={{ position: "relative", aspectRatio: "1 / 1", background: "white", borderBottom: "1px solid #f1f5f9" }}>
                    <Image src={img.imageUrl} alt={imgTitle || title} fill style={{ objectFit: "contain", padding: "0.65rem" }} />
                  </div>
                  {imgTitle && <div style={{ padding: "0.65rem 0.75rem", color: "#475569", fontWeight: 600, fontSize: "0.9rem" }}>{imgTitle}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </details>
  );
}

export const revalidate = 300;

export default async function AnimalTypeDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const animalType = await prisma.animalType.findUnique({
    where: { slug },
    include: {
      issues: { where: { isActive: true }, orderBy: { order: "asc" } },
      tabs: {
        orderBy: { order: "asc" },
        include: { images: { orderBy: { order: "asc" } } },
      },
      products: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, slug: true, name: true, name_ar: true, image: true },
      },
    },
  });

  if (!animalType || !animalType.isActive) {
    notFound();
  }

  const typeName = isAr ? animalType.name_ar || animalType.name : animalType.name;
  const typeDescription = isAr ? animalType.description_ar || animalType.description : animalType.description;

  return (
    <div style={{ direction: isAr ? "rtl" : "ltr" }}>
      <section
        style={{
          background: "linear-gradient(rgba(20, 35, 70, 0.75), rgba(20, 35, 70, 0.65)), url(/images/banners/products-banner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          padding: "5rem 1rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontSize: "0.9rem", marginBottom: "1rem", opacity: 0.95 }}>
            <Link href="/products" style={{ color: "inherit", textDecoration: "none" }}>
              {isAr ? "المنتجات" : "Products"}
            </Link>{" "}
            /{" "}
            <Link href="/products/livestock/by-animal-type" style={{ color: "inherit", textDecoration: "none" }}>
              {isAr ? "حسب نوع الحيوان" : "By Animal Type"}
            </Link>{" "}
            / <span>{typeName}</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 4.8vw, 3.2rem)", fontWeight: 900, marginBottom: "0.75rem" }}>{typeName}</h1>
          {typeDescription && <p style={{ fontSize: "1.05rem", maxWidth: "760px", lineHeight: 1.75, opacity: 0.95 }}>{typeDescription}</p>}
        </div>
      </section>

      <section style={{ padding: "3rem 1rem", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 50%) 650px", gap: "2rem", justifyContent: "center" }}>
          <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
            {animalType.imageUrl ? (
              <div style={{ position: "relative", aspectRatio: "16 / 9", backgroundColor: "white", borderBottom: "1px solid #f1f5f9" }}>
                <Image src={animalType.imageUrl} alt={typeName} fill style={{ objectFit: "contain", padding: "1rem" }} />
              </div>
            ) : (
              <div style={{ aspectRatio: "1 / 1", display: "grid", placeItems: "center", background: "white", color: "#94a3b8", fontWeight: 700 }}>
                {isAr ? "لا توجد صورة" : "No image"}
              </div>
            )}
            <div style={{ padding: "1.25rem" }}>
              <h2 style={{ marginBottom: "0.5rem", color: "#142346", fontSize: "1.2rem", fontWeight: 800 }}>{isAr ? "نبذة" : "Overview"}</h2>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.75 }}>{typeDescription || (isAr ? "لا يوجد وصف متاح حالياً." : "No description available yet.")}</p>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: "1.25rem", position: "sticky", top: "100px" }}>
              <h2 style={{ marginBottom: "1rem", color: "#142346", fontSize: "1.2rem", fontWeight: 800 }}>{isAr ? "المشكلات الشائعة" : "Most Common Issues"}</h2>
              {animalType.issues.length ? (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {animalType.issues.map((issue) => {
                    const issueTitle = isAr ? issue.title_ar || issue.title : issue.title;
                    const issueDesc = isAr ? issue.description_ar || issue.description : issue.description;
                    return (
                      <div key={issue.id} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.85rem", background: "#f8fafc" }}>
                        <h3 style={{ margin: "0 0 0.3rem 0", fontSize: "1rem", color: "#142346", fontWeight: 700 }}>{issueTitle}</h3>
                        {issueDesc && <p style={{ margin: 0, color: "#64748b", fontSize: "0.92rem", lineHeight: 1.6 }}>{issueDesc}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#64748b", margin: 0 }}>{isAr ? "لا توجد مشكلات مضافة حالياً." : "No issues added yet."}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {animalType.tabs.length > 0 && (
        <section style={{ padding: "3.5rem 1rem", backgroundColor: "white" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 900, color: "#142346", marginBottom: "1.5rem" }}>{isAr ? "تفاصيل إضافية" : "More Details"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {animalType.tabs.map((tab) => {
                const tabTitle = isAr ? tab.title_ar || tab.title : tab.title;
                const tabDesc = isAr ? tab.description_ar || tab.description : tab.description;
                return (
                  <AccordionSection 
                    key={tab.id}
                    title={tabTitle}
                    content={tabDesc}
                    images={tab.images}
                    isAr={isAr}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {animalType.products.length > 0 && (
        <section style={{ padding: "3.5rem 1rem", backgroundColor: "#f8fafc" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 900, color: "#142346", marginBottom: "1.5rem" }}>{isAr ? "منتجات مرتبطة" : "Related Products"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {animalType.products.map((product) => {
                const productName = isAr ? product.name_ar || product.name : product.name;
                return (
                  <Link key={product.id} href={{ pathname: "/product/[slug]", params: { slug: product.slug } } as any} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="card hover-card" style={{ overflow: "hidden", height: "100%" }}>
                      <div style={{ position: "relative", aspectRatio: "1 / 1", background: "white", borderBottom: "1px solid #f1f5f9" }}>
                        <Image src={product.image || "/images/cat-biostimulants.png"} alt={productName} fill style={{ objectFit: "contain", padding: "0.85rem" }} />
                      </div>
                      <div style={{ padding: "0.85rem", color: "#142346", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.45 }}>{productName}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
