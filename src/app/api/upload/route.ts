import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureUploadDir();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate mime types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload JPG, PNG, WebP or PDF.' },
        { status: 400 }
      );
    }

    // 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5 MB limit.' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `receipt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const destinationPath = path.join(UPLOAD_DIR, uniqueFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destinationPath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({ success: true, fileUrl }, { status: 201 });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json(
      { error: err.message || 'File upload failed.' },
      { status: 500 }
    );
  }
}
