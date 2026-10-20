import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (contentType.includes('application/json')) {
      const { base64Data, filename } = await request.json();
      if (!base64Data) {
        return NextResponse.json({ success: false, message: 'Tidak ada data gambar' }, { status: 400 });
      }

      // Check if it's a data url
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = 'png';

      if (matches && matches.length === 3) {
        const mime = matches[1];
        if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
        else if (mime.includes('webp')) ext = 'webp';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }

      const safeFilename = filename
        ? `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        : `bukti-${Date.now()}.${ext}`;

      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${safeFilename}`,
        dataUrl: base64Data,
      });
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || '.png';
      const safeFilename = `bukti-${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, safeFilename);

      fs.writeFileSync(filePath, buffer);

      const base64Data = `data:${file.type || 'image/png'};base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        url: `/uploads/${safeFilename}`,
        dataUrl: base64Data,
      });
    }

    return NextResponse.json({ success: false, message: 'Unsupported content type' }, { status: 400 });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
