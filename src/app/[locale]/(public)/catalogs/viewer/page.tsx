import PdfCatalogViewer from "@/components/pdf/PdfCatalogViewer";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

function decodeParam(param: string | undefined): string {  if (!param) return "";
  try {
    return decodeURIComponent(param);
  } catch (e) {
    return param;
  }
}

export default async function CatalogViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string; source?: string; title?: string; title_ar?: string; mode?: "single" | "spread" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Catalogs" });
  const sp = await searchParams;
  
  let source = "";
  let title = "";
  const initialViewMode = sp.mode || "spread";

  const isRtl = locale === "ar";
  const direction = isRtl ? "rtl" : "ltr";

  // If ID is provided, fetch from DB to get localized fields
  if (sp.id) {
    const catalog = await prisma.catalog.findUnique({
      where: { id: sp.id }
    });

    if (catalog) {
        source = catalog.fileUrl; // Always use the default fileUrl for the PDF source
        title = (isRtl && catalog.title_ar) ? catalog.title_ar : catalog.title;
      }
  } else {
    // Fallback to URL params
    source = decodeParam(sp.source);
    
    // Handle localized title from URL params if available
    const titleEn = decodeParam(sp.title);
    const titleAr = decodeParam(sp.title_ar);
    
    // Choose title based on current locale
    title = (isRtl && titleAr) ? titleAr : (titleEn || titleAr || "");
  }

  if (!source) {
    notFound();
  }

  return (
    <div className="section bg-slate-50 min-h-screen py-12" dir={direction}>
      <div className="container">
        <h1 className="text-2xl font-extrabold text-slate-900 pb-8 border-b border-slate-200">{title || t("title")}</h1>
        
        {/* Spacer for clear separation */}
        <div className="h-16 w-full"></div>
        
        <PdfCatalogViewer
          key={source}
          source={source}
          title={title}
          direction={direction}
          initialViewMode={initialViewMode}
          texts={{
            share: t("viewer.share"),
            download: t("viewer.download"),
            fullscreen: t("viewer.fullscreen"),
            exitFullscreen: t("viewer.exitFullscreen"),
            firstPage: t("viewer.firstPage"),
            previousPage: t("viewer.previousPage"),
            nextPage: t("viewer.nextPage"),
            lastPage: t("viewer.lastPage"),
            singlePage: t("viewer.singlePage"),
            spreadMode: t("viewer.spreadMode"),
            zoomIn: t("viewer.zoomIn"),
            zoomOut: t("viewer.zoomOut"),
            page: t("viewer.page"),
            of: t("viewer.of"),
            thumbnails: t("viewer.thumbnails"),
            outline: t("viewer.outline"),
            loading: t("viewer.loading"),
            noOutline: t("viewer.noOutline"),
            openSidebar: t("viewer.openSidebar"),
            closeSidebar: t("viewer.closeSidebar"),
          }}
        />
      </div>
    </div>
  );
}
