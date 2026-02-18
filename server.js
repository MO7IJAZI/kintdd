const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// --- HOSTINGER / SHARED HOSTING FIXES ---

// 1. Fix: UV_THREADPOOL_SIZE
// Prevents "Assertion failed: uv_thread_create" on Node 20+ in resource-constrained envs
if (!process.env.UV_THREADPOOL_SIZE) {
    process.env.UV_THREADPOOL_SIZE = '1';
    console.log('[Server] Setting UV_THREADPOOL_SIZE=1 for stability');
}

// 2. Fix: Logging
// Write logs to a file since stdout might be lost in some hosting panels
const LOG_FILE = path.join(__dirname, 'server-start.log');
function logToFile(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, entry);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
    console.log(msg);
}

logToFile('--- Server Starting ---');
logToFile(`NODE_ENV: ${process.env.NODE_ENV}`);
logToFile(`PORT: ${port}`);

// 3. Fix: Database Check
if (!process.env.DATABASE_URL) {
    const warning = 'CRITICAL WARNING: DATABASE_URL environment variable is MISSING. The app will likely crash when connecting to the database.';
    logToFile(warning);
    console.warn(warning);
}

// --- SERVER INITIALIZATION ---

try {
    // Initialize Next.js app
    // We use the standard 'next' package, assuming node_modules are available (standard for Hostinger)
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    app.prepare()
        .then(() => {
            createServer(async (req, res) => {
                try {
                    const parsedUrl = parse(req.url, true);
                    await handle(req, res, parsedUrl);
                } catch (err) {
                    const errMsg = `Error handling request: ${err.message}`;
                    console.error(errMsg);
                    logToFile(errMsg);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            })
            .once('error', (err) => {
                const fatalMsg = `Server start error: ${err.message}`;
                console.error(fatalMsg);
                logToFile(fatalMsg);
                process.exit(1);
            })
            .listen(port, () => {
                const successMsg = `> Ready on http://${hostname}:${port}`;
                console.log(successMsg);
                logToFile(successMsg);
            });
        })
        .catch((err) => {
            const initErr = `Next.js preparation failed: ${err.message}`;
            console.error(initErr);
            logToFile(initErr);
            process.exit(1);
        });

} catch (err) {
    const globalErr = `Global server error: ${err.message}`;
    console.error(globalErr);
    logToFile(globalErr);
    process.exit(1);
}
