import { NextResponse } from 'next/server';
import { getHppComponents, getProducts, saveProduct } from '@/lib/serverStorage';
import { calculateProductHpp } from '@/lib/hpp';

export async function GET() {
  try {
    const products = getProducts();
    const components = getHppComponents();

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
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
