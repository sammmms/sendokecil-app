import { NextRequest, NextResponse } from 'next/server';
import { deleteOrder, getOrderById, updateOrder } from '@/lib/serverStorage';
import { isSupabaseConfigured, upsertSupabaseOrder } from '@/lib/supabaseStorage';
import { createClient } from '@/utils/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const updated = updateOrder(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (isSupabaseConfigured()) {
      upsertSupabaseOrder(updated).catch((e) => console.warn('Supabase patch sync:', e));
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = deleteOrder(id);
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      supabase?.from('orders').delete().eq('id', id).then();
    }

    return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
