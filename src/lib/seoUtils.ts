import { Metadata } from "next";

// JSON-LD Product Schema Generator
export function generateProductSchema(product: {
    name: string;
    slug: string;
    description?: string;
    shortDesc?: string;
    image?: string;
    benefits?: string;
}, locale?: string) {
    const baseUrl = locale === 'ar' ? "https://kafri-intl.com/ar" : "https://kafri-intl.com";
    return {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.image || "/images/logo.png",
        "description": product.shortDesc || product.description,
        "url": `${baseUrl}/product/${product.slug}`,
        "brand": {
            "@type": "Brand",
            "name": "KINT Kafri International",
            "logo": "https://kafri-intl.com/images/logo.png",
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150",
        },
        "offers": {
            "@type": "AggregateOffer",
            "availability": "https://schema.org/InStock",
            "priceCurrency": "USD",
        },
    };
}

// JSON-LD Organization Schema
export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "KINT Kafri International",
        "url": "https://kafri-intl.com",
        "logo": "https://kafri-intl.com/images/logo.png",
        "description": "Specialized in providing agricultural and veterinary materials, biostimulants, and specialty fertilizers",
        "sameAs": [
            "https://www.facebook.com/kafri",
            "https://www.linkedin.com/company/kafri",
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+48-796-106-899",
            "contactType": "Customer Service",
        },
    };
}

// Create metadata for products
export function createProductMetadata(product: {
    name: string;
    slug: string;
    shortDesc?: string;
    description?: string;
    image?: string;
    metaTitle?: string;
    metaDesc?: string;
}, locale?: string, slug?: string): Metadata {
    const title = product.metaTitle || `${product.name} | KINT Kafri International`;
    const description = product.metaDesc || product.shortDesc || "High-quality agricultural and veterinary product from KINT";
    const baseUrl = locale === 'ar' ? "https://kafri-intl.com/ar" : "https://kafri-intl.com";
    const canonicalSlug = slug || product.slug;

    return {
        title,
        description,
        keywords: [product.name, "agricultural products", "KINT", "specialty fertilizers"],
        alternates: {
            canonical: `${baseUrl}/product/${canonicalSlug}`,
        },
        openGraph: {
            title,
            description,
            url: `/product/${product.slug}`,
            type: "website",
            images: [
                {
                    url: product.image || "/images/logo.png",
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [product.image || "/images/logo.png"],
        },
    };
}

// Create metadata for pages
export function createPageMetadata(page: {
    title: string;
    description?: string;
    url: string;
    image?: string;
}): Metadata {
    return {
        title: page.title,
        description: page.description || "KINT - Agricultural and Veterinary Solutions",
        alternates: {
            canonical: page.url,
        },
        openGraph: {
            title: page.title,
            description: page.description,
            url: page.url,
            type: "website",
            images: [
                {
                    url: page.image || "/images/logo.png",
                    width: 1200,
                    height: 630,
                    alt: page.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: page.title,
            description: page.description,
            images: [page.image || "/images/logo.png"],
        },
    };
}
