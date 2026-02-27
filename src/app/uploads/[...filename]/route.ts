import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    // In App Router, params must be awaited if it's a dynamic route in newer Next.js versions,
    // but in current stable it's an object. However, let's be safe.
    // Also, we need to handle the case where params.filename is undefined or empty
    if (!params || !params.filename) {
        return new NextResponse('Bad Request', { status: 400 });
    }

    const filename = params.filename.join('/');
    
    // DEBUGGING: Log the paths to see where it's looking
    const cwd = process.cwd();
    // In standalone mode, we are often in .next/standalone
    // The public folder from build time is copied to .next/standalone/public
    
    // We try multiple possible locations for robustness
    const possiblePaths = [
        path.join(cwd, 'public', 'uploads', filename), // Standard standalone
        path.join(cwd, '..', '..', 'public', 'uploads', filename), // If cwd is inside .next/server...
        path.join('/home/kint-group/htdocs/www.kint-group.com/public/uploads', filename) // Hardcoded fallback for VPS
    ];

    let filePath = '';
    let fileExists = false;

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            filePath = p;
            fileExists = true;
            break;
        }
    }

    if (!fileExists) {
      console.error(`File not found in any checked path. Checked: ${possiblePaths.join(', ')}`);
      return new NextResponse(`File not found. Searched in: ${possiblePaths.map(p => path.dirname(p)).join(', ')}`, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error serving file:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
