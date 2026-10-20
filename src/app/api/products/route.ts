import { NextResponse } from 'next/server';
import { deleteProduct, getHppComponents, getProducts, saveProduct } from '@/lib/serverStorage';
import { calculateProductHpp } from '@/lib/hpp';
import { deleteSupabaseProduct, fetchSupabaseProducts, isSupabaseConfigured, upsertSupabaseProduct } from '@/lib/supabaseStorage';

export async function GET() {
  try {
    let products = getProducts();
    const components = getHppComponents();

    if (isSupabaseConfigured()) {
      const cloudProducts = await fetchSupabaseProducts();
      if (cloudProducts && cloudProducts.length > 0) {
        products = cloudProducts;
      }
    }

    // Enrich products with computed live HPP
    const enriched = products.map((p) => {
      const calculatedHpp = calculateProductHpp(p, components);
      const grossProfit = p.price - calculatedHpp;
      const marginPct = p.price > 0 ? Math.round((grossProfit / p.price) * 100) : 0;
      return {
        ...p,
        calculatedHpp,
        grossProfit,
        marginPct,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !body.name || body.price === undefined) {
      return NextResponse.json({ success: false, message: 'Data produk tidak lengkap' }, { status: 400 });
    }
    const saved = saveProduct(body);

    if (isSupabaseConfigured()) {
      upsertSupabaseProduct(saved).catch((e) => console.warn('Supabase product sync:', e));
    }

    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID produk tidak ditentukan' }, { status: 400 });
    }

    deleteProduct(id);

    if (isSupabaseConfigured()) {
      await deleteSupabaseProduct(id);
    }

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
