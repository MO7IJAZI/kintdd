import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Check if directory exists
    const exists = fs.existsSync(uploadDir);
    
    // Get list of files
    let files: string[] = [];
    if (exists) {
      files = fs.readdirSync(uploadDir);
    }
    
    // Check permissions (try to write a test file)
    let writable = false;
    try {
      const testFile = path.join(uploadDir, 'test-perm.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      writable = true;
    } catch (e) {
      writable = false;
    }

    return NextResponse.json({
      cwd: process.cwd(),
      uploadDir,
      exists,
      writable,
      files: files.slice(0, 10), // Limit to first 10
      env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}