import 'dotenv/config';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import next from 'next';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, 'server-start.log');

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
}

log("Starting server.ts...");

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

// Fallback server function
function startFallbackServer(errorMessage: string): void {
  log("Starting FALLBACK server due to error: " + errorMessage);
  
  createServer((req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(503, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>503 Service Unavailable</h1>
      <p>The application failed to start.</p>
      <p><strong>Error:</strong> ${errorMessage}</p>
      <p>Please check <code>server-start.log</code> in the root directory for more details.</p>
      <p><em>Possible causes: Missing build (.next folder), missing dependencies, or database connection error.</em></p>
    `);
  }).listen(port, () => {
    log(`Fallback server listening on port ${port}`);
  });
}

try {
  log(`Initializing Next.js (dev: ${dev})...`);
  const app = next({ dev });
  const handle = app.getRequestHandler();

  app.prepare()
    .then(() => {
      log("Next.js prepared successfully.");
      createServer((req: IncomingMessage, res: ServerResponse) => {
        handle(req, res);
      }).listen(port, () => {
        log(`🚀 Next.js Server ready on port ${port}`);
      });
    })
    .catch((err: any) => {
      const stack = err?.stack || 'No stack trace';
      const message = err?.message || 'Unknown error';
      log("Error during app.prepare(): " + stack);
      startFallbackServer("Next.js build not found or failed to load. Ensure 'npm run build' was successful. Details: " + message);
    });

} catch (err: any) {
  const stack = err?.stack || 'No stack trace';
  const message = err?.message || 'Unknown error';
  log("Critical error in server.ts: " + stack);
  startFallbackServer("Critical startup error: " + message);
}
