import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],
 
  // Used when no locale matches
  defaultLocale: 'en',

  pathnames: {
    '/': '/',
    '/product/[slug]': {
      en: '/product/[slug]',
      ar: '/product/[slug]'
    },
    '/product-category/[slug]': {
      en: '/product-category/[slug]',
      ar: '/product-category/[slug]'
    },
    '/products': {
      en: '/products',
      ar: '/products'
    },
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
    '/product-category/biostimulants': {
      en: '/product-category/biostimulants',
      ar: '/product-category/biostimulants'
    },
    '/product-category/activators': {
      en: '/product-category/activators',
      ar: '/product-category/activators'
    },
    '/product-category/bioproducts': {
      en: '/product-category/bioproducts',
      ar: '/product-category/bioproducts'
    },
    '/product-category/foliar-fertilizers': {
      en: '/product-category/foliar-fertilizers',
      ar: '/product-category/foliar-fertilizers'
    },
    '/product-category/organic-farming': {
      en: '/product-category/organic-farming',
      ar: '/product-category/organic-farming'
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
    '/blog/[slug]': {
      en: '/blog/[slug]',
      ar: '/blog/[slug]'
    },
    '/news': {
      en: '/news',
      ar: '/news'
    },
    '/contact': {
      en: '/contact',
      ar: '/contact'
    },
    '/crop-farming': {
      en: '/crop-farming',
      ar: '/crop-farming'
    },
    '/crops/[slug]': {
      en: '/crops/[slug]',
      ar: '/crops/[slug]'
    },
    '/treatment-efficacy': {
      en: '/treatment-efficacy',
      ar: '/treatment-efficacy'
    },
    '/treatment-efficacy/optimum-conditions': {
      en: '/treatment-efficacy/optimum-conditions',
      ar: '/treatment-efficacy/optimum-conditions'
    },
    '/mixing-table': {
      en: '/mixing-table',
      ar: '/mixing-table'
    },
    '/experts-forum': {
      en: '/experts-forum',
      ar: '/experts-forum'
    },
    '/experts-forum/[slug]': {
      en: '/experts-forum/[slug]',
      ar: '/experts-forum/[slug]'
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
    // Admin Routes
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
    '/admin/products/new': {
      en: '/admin/products/new',
      ar: '/admin/products/new'
    },
    '/admin/products/[id]': {
      en: '/admin/products/[id]',
      ar: '/admin/products/[id]'
    },
    '/admin/crops': {
      en: '/admin/crops',
      ar: '/admin/crops'
    },
    '/admin/crops/new': {
      en: '/admin/crops/new',
      ar: '/admin/crops/new'
    },
    '/admin/crops/[id]': {
      en: '/admin/crops/[id]',
      ar: '/admin/crops/[id]'
    },
    '/admin/expert-articles': {
      en: '/admin/expert-articles',
      ar: '/admin/expert-articles'
    },
    '/admin/expert-articles/new': {
      en: '/admin/expert-articles/new',
      ar: '/admin/expert-articles/new'
    },
    '/admin/expert-articles/[id]': {
      en: '/admin/expert-articles/[id]',
      ar: '/admin/expert-articles/[id]'
    },
    '/admin/blog': {
      en: '/admin/blog',
      ar: '/admin/blog'
    },
    '/admin/blog/new': {
      en: '/admin/blog/new',
      ar: '/admin/blog/new'
    },
    '/admin/blog/[id]': {
      en: '/admin/blog/[id]',
      ar: '/admin/blog/[id]'
    },
    '/admin/career': {
      en: '/admin/career',
      ar: '/admin/career'
    },
    '/admin/career/new': {
      en: '/admin/career/new',
      ar: '/admin/career/new'
    },
    '/admin/career/[id]': {
      en: '/admin/career/[id]',
      ar: '/admin/career/[id]'
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
    '/admin/company-data': {
      en: '/admin/company-data',
      ar: '/admin/company-data'
    },
    '/admin/inquiries': {
      en: '/admin/inquiries',
      ar: '/admin/inquiries'
    },
    '/admin/settings': {
      en: '/admin/settings',
      ar: '/admin/settings'
    },
    '/admin/documents': {
      en: '/admin/documents',
      ar: '/admin/documents'
    },
    '/admin/documents/create': {
      en: '/admin/documents/create',
      ar: '/admin/documents/create'
    },
    '/admin/documents/edit/[id]': {
      en: '/admin/documents/edit/[id]',
      ar: '/admin/documents/edit/[id]'
    },
    '/admin/pages': {
      en: '/admin/pages',
      ar: '/admin/pages'
    },
    '/admin/pages/new': {
      en: '/admin/pages/new',
      ar: '/admin/pages/new'
    },
    '/admin/pages/[id]': {
      en: '/admin/pages/[id]',
      ar: '/admin/pages/[id]'
    }
  }
});
