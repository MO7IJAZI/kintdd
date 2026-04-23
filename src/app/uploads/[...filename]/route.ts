import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  // Next.js 15 / recent Next.js 14 requires awaiting params or treating it as a promise in some configs,
  // but let's try a safer type definition that works across versions.
  props: { params: Promise<{ filename: string[] }> }
) {
  try {
    const params = await props.params;

    if (!params || !params.filename) {
        // Fallback for older Next.js where params might be passed directly
        // @ts-ignore
        if (props.params && props.params.filename) {
             // @ts-ignore
             return serveFile(props.params.filename);
        }
        return new NextResponse('Bad Request: Missing filename', { status: 400 });
    }

    return serveFile(params.filename);
  } catch (error: any) {
    console.error('Error serving file:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

function serveFile(filenameParts: string[]) {
    const filename = filenameParts.join('/');
    
    const cwd = process.cwd();
    const possiblePaths = [
        path.join(cwd, 'public', 'uploads', filename),
        path.join(cwd, '..', '..', 'public', 'uploads', filename),
        path.join('/home/kint-group/htdocs/www.kint-group.com/public/uploads', filename)
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
      return new NextResponse(`File not found. Checked paths: ${possiblePaths.map(p => path.dirname(p)).join(', ')}`, { status: 404 });
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
      case '.ttf':
        contentType = 'font/ttf';
        break;
      case '.otf':
        contentType = 'font/otf';
        break;
      case '.woff':
        contentType = 'font/woff';
        break;
      case '.woff2':
        contentType = 'font/woff2';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
}
