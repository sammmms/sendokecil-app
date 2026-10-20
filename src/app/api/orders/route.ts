import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/serverStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search')?.toLowerCase();

    let orders = getOrders();

    if (status && status !== 'all') {
      if (status === 'pending_approval') {
        orders = orders.filter((o) => o.paymentStatus === 'menunggu_konfirmasi');
      } else if (status === 'lunas') {
        orders = orders.filter((o) => o.paymentStatus === 'lunas');
      } else if (status === 'active') {
        orders = orders.filter((o) => o.fulfillmentStatus !== 'selesai' && o.paymentStatus !== 'batal');
      } else {
        orders = orders.filter((o) => o.paymentStatus === status || o.fulfillmentStatus === status);
      }
    }

    if (type && type !== 'all') {
      orders = orders.filter((o) => o.orderType === type);
    }

    if (priority && priority !== 'all') {
      orders = orders.filter((o) => o.priority === priority);
    }

    if (search) {
      orders = orders.filter(
        (o) =>
          o.customerName.toLowerCase().includes(search) ||
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerPhone.includes(search) ||
          o.deliveryAddress.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nama pemesan dan daftar pesanan wajib diisi.' },
        { status: 400 }
      );
    }

    const newOrder = createOrder({
      orderDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone?.trim() || '',
      orderType: body.orderType || 'antar',
      deliveryAddress: body.deliveryAddress?.trim() || '',
      deliveryTimeNote: body.deliveryTimeNote?.trim() || '',
      priority: body.priority || 'normal',
      items: body.items,
      totalPcs: body.totalPcs || body.items.reduce((acc: number, it: any) => acc + it.quantity, 0),
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee || 0,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod || 'TF',
      paymentStatus: body.paymentStatus || 'menunggu_konfirmasi',
      fulfillmentStatus: 'menunggu',
      paymentProofUrl: body.paymentProofUrl || '',
      paymentProofUploadedAt: body.paymentProofUrl ? new Date().toISOString() : undefined,
      customerNotes: body.customerNotes?.trim() || '',
      adminNotes: '',
      greetingCard: body.greetingCard,
    });

    return NextResponse.json({ success: true, data: newOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
