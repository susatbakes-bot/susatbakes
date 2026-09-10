import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
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

    // Upload directly to Vercel Blob
    const blob = await put(`receipts/${uniqueFileName}`, file, {
      access: 'public',
    });

    return NextResponse.json({ success: true, fileUrl: blob.url }, { status: 201 });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json(
      { error: err.message || 'File upload failed.' },
      { status: 500 }
    );
  }
}