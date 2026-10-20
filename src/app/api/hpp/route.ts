import { NextRequest, NextResponse } from 'next/server';
import { deleteHppComponent, getHppComponents, saveHppComponent } from '@/lib/serverStorage';

export async function GET() {
  try {
    const components = getHppComponents();
    return NextResponse.json({ success: true, data: components });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || body.cost === undefined) {
      return NextResponse.json({ success: false, message: 'Nama komponen dan biaya wajib diisi' }, { status: 400 });
    }

    const component = {
      id: body.id || `comp-${Date.now()}`,
      name: body.name.trim(),
      category: body.category || 'bahan_baku',
      cost: Number(body.cost) || 0,
      unit: body.unit || 'porsi',
      note: body.note?.trim() || '',
    };

    const saved = saveHppComponent(component);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID komponen tidak ditemukan' }, { status: 400 });
    }
    const ok = deleteHppComponent(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
