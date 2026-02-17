# 🚀 KINT Website - Hostinger Cloud Startup Deployment Guide

This guide is specifically tailored for **Hostinger Cloud Startup** plans using **hPanel**.

## Overview

Hostinger Cloud plans are managed environments. You will use the **"Setup Node.js App"** feature in hPanel, combined with **SSH** for building/deploying.

## Prerequisites

1.  **Hostinger Cloud Startup Plan**.
2.  **SSH Access** enabled in hPanel.
3.  **Database** created in hPanel (MySQL Database).

## Step 1: Prepare Database (hPanel)

1.  Go to **Databases** > **Management**.
2.  Create a new MySQL Database.
    *   Note the **Database Name**, **Username**, and **Password**.
3.  Go to **SSH Access** in hPanel to see your SSH login details (IP, User, Port).

## Step 2: Configure Node.js App (hPanel)

1.  Go to **Websites** > **Manage** > **Advanced** > **Node.js App**.
2.  Click **Create New Application**.
    *   **Node.js Version**: Select **v20** (or latest LTS).
    *   **Application Mode**: **Production**.
    *   **Application Root**: `public_html` (or a subfolder if you prefer, e.g., `kint-app`).
    *   **Application Startup File**: `server.js` (We have provided a custom one).
    *   **Application Port**: Leave as default (Hostinger assigns one internally).
3.  Click **Create**.
4.  **IMPORTANT**: Do **NOT** click "Enter Control Panel" or "Install" yet. We need to upload our code first.

## Step 3: Deploy Code via SSH

1.  **Connect to SSH**:
    ```bash
    ssh -p 65002 u123456789@your-server-ip
    ```
    *(Replace with your actual SSH details from hPanel)*

2.  **Clean the directory** (if default files exist):
    ```bash
    cd public_html
    rm -rf *
    ```
    *   **NOTE:** If `rm -rf *` is too dangerous, just remove `index.php` or `default.php`.

3.  **Clone the Repository**:
    ```bash
    git clone <your-repo-url> .
    ```
    *(Don't forget the dot `.` at the end to clone into current directory)*

4.  **Configure Environment**:
    Create the `.env` file:
    ```bash
    cp .env.production.example .env
    nano .env
    ```
    *   Fill in `DATABASE_URL` with your MySQL details from Step 1.
    *   Set `NEXTAUTH_URL` to your domain (e.g., `https://kint-group.com`).
    *   Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

5.  **Setup .htaccess (Required for Litespeed)**
    Verify that `.htaccess` exists and contains the rewrite rules to route traffic to the Node.js port.
    ```bash
    cat .htaccess
    ```
    If missing, creating it:
    ```bash
    nano .htaccess
    ```
    Paste:
    ```apache
    RewriteEngine On
    RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
    ```

6.  **Run Deployment Script**:
    We have created a `deploy.sh` script that handles everything (install, build, migration).
    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```

    **What this script does:**
    *   Installs dependencies.
    *   Builds the Next.js app (Standalone mode).
    *   Migrates the database.
    *   Seeds initial data.
    *   **NOTE**: On Hostinger Cloud, `pm2` commands in the script might fail if not permitted. That's okay! The hPanel Node.js manager handles the process.

## Step 4: Finalize in hPanel

1.  Go back to **hPanel** > **Node.js App**.
2.  Click **Restart** button for your application.
3.  Click **Open** to verify your site is running.

## Troubleshooting

*   **503 Service Unavailable / Application Failed to Start**:
    *   Check `server-debug.log` in your `public_html` folder.
    *   Ensure `server.js` is set as the Startup File in hPanel.
    *   Ensure `.next/standalone` folder exists (run `ls -la .next/standalone` in SSH).

*   **Database Error**:
    *   Double check `DATABASE_URL` in `.env`.
    *   Ensure the database user has permissions (default in Hostinger).

*   **Static Files (Images/CSS) 404**:
    *   Our `scripts/post-build.js` automatically copies static files to the correct place.
    *   If images are missing, check if `public` folder contents are in `.next/standalone/public`.

## Fast & Light Architecture

*   **Standalone Build**: We use Next.js `output: 'standalone'`. This means we don't run the heavy `next start` command. Instead, we run a lightweight Node.js server from `.next/standalone/server.js`.
*   **Compression**: Gzip is enabled.
*   **Startup**: The custom `server.js` automatically detects the standalone build and launches it.
