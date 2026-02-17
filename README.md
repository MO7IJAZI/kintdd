# KINT - Kafri International Website

A premium corporate website for agricultural innovations, built with Next.js 15 and MySQL. Inspired by intermag.eu.

## Features
- **Modern UI/UX**: Professional design with agricultural aesthetic.
- **Dynamic Content**: Public pages for products, categories, and blog posts.
- **Admin Dashboard**: Full CMS capabilities for administrators.
- **Responsive**: Fully optimized for all device sizes.
- **SEO Ready**: Optimized metadata and semantic HTML.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Vanilla CSS.
- **Backend**: Next.js API Routes.
- **Database**: MySQL via Prisma ORM.
- **Authentication**: NextAuth.js (v5 Beta).

## Getting Started

### 1. Database Setup
Update the `DATABASE_URL` in your `.env` file with your MySQL credentials:
```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database
Run migrations to create the tables:
```bash
npx prisma migrate dev --name init
```

### 4. Seed Initial Data
Create the default admin user and initial categories:
```bash
npx prisma db seed
```
*Default login: `admin@kint.com` / `admin123`*

### 5. Run Development Server
```bash
npm run dev
```

## Folder Structure
- `src/app/(public)`: All public-facing pages.
- `src/app/admin`: Admin dashboard and management pages.
- `src/components`: Reusable UI and layout components.
- `src/lib`: Utility functions and database client.
- `prisma`: Database schema and seed scripts.
- `public/images`: Curated and AI-generated high-quality assets.
