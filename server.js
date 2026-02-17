const http = require('http');
const path = require('path');
const fs = require('fs');

// 1. Basic Setup & Logging
const LOG_FILE = path.join(__dirname, 'server-debug.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (e) {}
}

log("----------------------------------------");
log("Server process started.");
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`Current Directory: ${process.cwd()}`);

// 2. Load Environment Variables
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    log("Loaded .env file");
  } else {
    log("No .env file found in root");
  }
} catch (e) {
  log(`Failed to load .env: ${e.message}`);
}

// 3. Define the Request Handler (Dynamic)
let currentHandler = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><meta http-equiv="refresh" content="5"></head>
      <body>
        <h1>Application Starting...</h1>
        <p>Please wait while the server initializes.</p>
        <p>Current time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
};

// 4. Start the HTTP Server IMMEDIATELY
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  try {
    currentHandler(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    res.writeHead(500);
    res.end("Internal Server Error during request handling");
  }
});

server.listen(port, (err) => {
  if (err) {
    log(`FATAL: Failed to bind port ${port}: ${err.message}`);
    process.exit(1);
  }
  log(`Server listening on port ${port}`);
  
  // 5. Attempt to Load Next.js App
  initializeNextApp();
});

// 6. Initialization Logic
async function initializeNextApp() {
  try {
    log("Initializing Next.js application...");
    
    // Check for standalone build
    const standaloneDir = path.join(__dirname, '.next', 'standalone');
    let nextHandler;

    if (fs.existsSync(standaloneDir)) {
      log(`Found standalone directory: ${standaloneDir}`);
      
      // Hostinger Cloud / Shared Hosting Strategy:
      // We cannot reliably change CWD because of permission/path restrictions in some environments.
      // Instead, we should require the standalone server directly.
      // The standalone server.js in Next.js 12+ (and 14/15/16) typically starts the server immediately.
      
      log("Delegating to standalone server...");
      
      // IMPORTANT: Standalone server expects to be run from its own directory to find .next
      // But we are in root.
      // We try to change directory. If it fails, we warn but proceed.
      try {
        process.chdir(standaloneDir);
        log(`Changed cwd to: ${process.cwd()}`);
      } catch (e) {
        log(`WARNING: Failed to change cwd: ${e.message}. Assets might 404 if not copied correctly.`);
      }

      // We need to require the file. 
      // Next.js standalone server.js starts listening on PORT env var.
      // We must ensure we don't double-bind port. 
      // Our outer server is already listening? NO, we called server.listen() above.
      // WAIT! If we require standalone/server.js, it will TRY to listen on PORT.
      // If we are ALREADY listening on PORT in this file (line 62), it will crash with EADDRINUSE.
      
      // CORRECT APPROACH FOR HOSTINGER WRAPPER:
      // 1. If we find standalone, we should NOT have started our own server yet?
      //    OR we should close our server and let Next.js take over?
      //    OR we should proxy requests?
      
      // Current architecture:
      // This server.js is the ENTRY POINT. Hostinger starts THIS file.
      // If we want "fast and light", we should use the standalone server logic.
      
      // Modified Logic:
      // If standalone exists, we use its handler instead of creating our own http server?
      // But Hostinger expects `server.js` to BE the server.
      
      // Let's look at how we are using `currentHandler`.
      // We start a server at line 52.
      // Then we `initializeNextApp`.
      // Inside here, we require `next`.
      
      // IF we are using standalone, we shouldn't be requiring 'next' from node_modules if possible,
      // because the whole point is to not need full node_modules.
      // But standalone folder HAS node_modules inside it.
      
      // The standalone/server.js does this:
      // const NextServer = require('next/dist/server/next-server').default
      // const server = new NextServer(...)
      // server.getRequestHandler() ...
      // ... startServer(...)
      
      // So if we just require it, it starts a server.
      // We should probably just use the Custom Server API from the standalone build.
      
      // REVISED STRATEGY:
      // We will stick to the Custom Server API using the `next` package available in the STANDALONE node_modules.
      // This is the safest way to wrap it.
      
      // Point 'next' to the one inside standalone if available
      const nextPath = path.join(standaloneDir, 'node_modules', 'next');
      let nextLib;
      
      if (fs.existsSync(nextPath)) {
         log("Using 'next' from standalone node_modules");
         nextLib = require(nextPath);
      } else {
         log("Using global/root 'next'");
         nextLib = require('next');
      }

      const { parse } = require('url');
      const dev = process.env.NODE_ENV !== 'production';
      
      // Initialize app with correct directory
      // If we successfully chdir'd, dir is '.'
      // If not, dir is standaloneDir
      const app = nextLib({ dev, dir: process.cwd() }); 
      const handle = app.getRequestHandler();

      await app.prepare();
      log("Next.js app.prepare() completed successfully.");

      // Update the handler to use Next.js
      currentHandler = (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      };

      log("Server fully operational (Standalone Mode).");
      return; // Exit function, we are done
    }
    
    // Use standard Next.js Custom Server API
    // This works for both standalone (if node_modules are present) and standard build
    const next = require('next');
    const { parse } = require('url');
    
    const dev = process.env.NODE_ENV !== 'production';
    const app = next({ dev, dir: __dirname });
    const handle = app.getRequestHandler();
    
    await app.prepare();
    log("Next.js app.prepare() completed successfully.");
    
    // Update the handler to use Next.js
    currentHandler = (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    };
    
    log("Server fully operational.");
    
  } catch (err) {
    log(`CRITICAL INITIALIZATION ERROR: ${err.message}`);
    log(err.stack);
    
    // Update handler to show error page
    currentHandler = (req, res) => {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family:sans-serif; padding:2rem;">
            <h1 style="color:red">Application Failed to Start</h1>
            <p>The server encountered an error during initialization.</p>
            <div style="background:#eee; padding:1rem; border-radius:5px; overflow:auto;">
              <pre>${err.message}\n\n${err.stack}</pre>
            </div>
            <p>Check <code>server-debug.log</code> for full details.</p>
          </body>
        </html>
      `);
    };
  }
}

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err.message}`);
  log(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`);
});
