import { Cairo, Inter, Outfit } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
});
