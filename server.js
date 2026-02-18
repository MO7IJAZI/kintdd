const path = require('path');
const fs = require('fs');

// 1. Fix for Hostinger/Node 20 resource limits (Assertion failed: uv_thread_create)
// We set this programmatically to avoid modifying package.json or ecosystem.config.js
if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = '1';
  console.log('Setting UV_THREADPOOL_SIZE to 1 for shared hosting compatibility');
}

// 2. Check for critical environment variables
if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is missing! The application will likely crash.');
}

// 3. Define the standalone server path
// Next.js with output: 'standalone' creates the server at .next/standalone/server.js
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServerPath = path.join(standaloneDir, 'server.js');

if (fs.existsSync(standaloneServerPath)) {
  console.log(`Starting standalone server from: ${standaloneServerPath}`);
  
  // Change directory to the standalone folder so it can find its dependencies
  try {
    process.chdir(standaloneDir);
    console.log(`Changed working directory to: ${process.cwd()}`);
  } catch (err) {
    console.error(`Failed to change directory: ${err.message}`);
  }

  // Require the standalone server
  // This executes the server and starts listening on process.env.PORT
  require(standaloneServerPath);
} else {
  // Fallback for development or if build failed
  console.log('Standalone server not found. Starting standard Next.js server...');
  
  const { createServer } = require('http');
  const { parse } = require('url');
  const next = require('next');

  const dev = process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  const port = process.env.PORT || 3000;

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    })
      .once('error', (err) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  });
}
