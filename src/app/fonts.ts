import { Inter, Tajawal } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const outfit = Inter({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const cairo = Tajawal({
  subsets: ['arabic'],
  variable: '--font-cairo',
  weight: ['400', '700']
});
