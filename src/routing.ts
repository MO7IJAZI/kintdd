import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],
 
  // Used when no locale matches
  defaultLocale: 'en',

  pathnames: {
    '/': '/',
    '/catalogs': {
      en: '/catalogs',
      ar: '/catalogs'
    },
    '/products/agricultural': {
      en: '/products/agricultural',
      ar: '/products/agricultural'
    },
    '/products/animal': {
      en: '/products/animal',
      ar: '/products/animal'
    },
    '/product-category/agricultural': {
      en: '/product-category/agricultural',
      ar: '/product-category/agricultural'
    },
    '/product-category/crop-guides': {
      en: '/product-category/crop-guides',
      ar: '/product-category/crop-guides'
    },
    '/product-category/veterinary': {
      en: '/product-category/veterinary',
      ar: '/product-category/veterinary'
    },
    '/product-category/by-animal': {
      en: '/product-category/by-animal',
      ar: '/product-category/by-animal'
    },
    '/products-for-animals/poultry': {
      en: '/products-for-animals/poultry',
      ar: '/products-for-animals/poultry'
    },
    '/products-for-animals/ruminants': {
      en: '/products-for-animals/ruminants',
      ar: '/products-for-animals/ruminants'
    },
    '/products-for-animals/swine': {
      en: '/products-for-animals/swine',
      ar: '/products-for-animals/swine'
    },
    '/product-category/animal': {
      en: '/product-category/animal',
      ar: '/product-category/animal'
    },
    '/about': {
      en: '/about',
      ar: '/about'
    },
    '/blog': {
      en: '/blog',
      ar: '/blog'
    },
    '/contact': {
      en: '/contact',
      ar: '/contact'
    },
    '/crop-farming': {
      en: '/crop-farming',
      ar: '/crop-farming'
    },
    '/treatment-efficacy/optimum-conditions': {
      en: '/treatment-efficacy/optimum-conditions',
      ar: '/treatment-efficacy/optimum-conditions'
    },
    '/mixing-table': {
      en: '/mixing-table',
      ar: '/mixing-table'
    },
    '/about/rd-centre': {
      en: '/about/rd-centre',
      ar: '/about/rd-centre'
    },
    '/about/production-plants': {
      en: '/about/production-plants',
      ar: '/about/production-plants'
    },
    '/about/logistics-centre': {
      en: '/about/logistics-centre',
      ar: '/about/logistics-centre'
    },
    '/about/company-data': {
      en: '/about/company-data',
      ar: '/about/company-data'
    },
    '/about/career': {
      en: '/about/career',
      ar: '/about/career'
    },
    '/about/certificates': {
      en: '/about/certificates',
      ar: '/about/certificates'
    },
    '/about/awards': {
      en: '/about/awards',
      ar: '/about/awards'
    },
    '/contact/headquarter': {
      en: '/contact/headquarter',
      ar: '/contact/headquarter'
    },
    '/contact/export-department': {
      en: '/contact/export-department',
      ar: '/contact/export-department'
    },
    '/contact/local-representatives': {
      en: '/contact/local-representatives',
      ar: '/contact/local-representatives'
    },
    '/admin': {
      en: '/admin',
      ar: '/admin'
    },
    '/admin/categories': {
      en: '/admin/categories',
      ar: '/admin/categories'
    },
    '/admin/products': {
      en: '/admin/products',
      ar: '/admin/products'
    },
    '/admin/crops': {
      en: '/admin/crops',
      ar: '/admin/crops'
    },
    '/admin/expert-articles': {
      en: '/admin/expert-articles',
      ar: '/admin/expert-articles'
    },
    '/admin/blog': {
      en: '/admin/blog',
      ar: '/admin/blog'
    },
    '/admin/career': {
      en: '/admin/career',
      ar: '/admin/career'
    },
    '/admin/applications': {
      en: '/admin/applications',
      ar: '/admin/applications'
    },
    '/admin/certificates': {
      en: '/admin/certificates',
      ar: '/admin/certificates'
    },
    '/admin/awards': {
      en: '/admin/awards',
      ar: '/admin/awards'
    },
    '/admin/headquarter': {
      en: '/admin/headquarter',
      ar: '/admin/headquarter'
    },
    '/admin/inquiries': {
      en: '/admin/inquiries',
      ar: '/admin/inquiries'
    },
    '/admin/settings': {
      en: '/admin/settings',
      ar: '/admin/settings'
    }
  }
});
