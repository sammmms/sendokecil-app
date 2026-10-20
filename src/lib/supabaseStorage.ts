import { createClient, getSupabaseConfig } from '@/utils/supabase/client';
import { HPPComponent, Order, Product } from '@/types';

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

// ---------------- ORDERS ---------------- //

export async function fetchSupabaseOrders(): Promise<Order[] | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch orders warning:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      orderDate: row.order_date,
      customerName: row.customer_name,
      customerPhone: row.customer_phone || '',
      orderType: row.order_type,
      deliveryAddress: row.delivery_address || '',
      deliveryTimeNote: row.delivery_time_note || '',
      priority: row.priority || 'normal',
      items: row.items || [],
      totalPcs: Number(row.total_pcs) || 0,
      subtotal: Number(row.subtotal) || 0,
      deliveryFee: Number(row.delivery_fee) || 0,
      totalAmount: Number(row.total_amount) || 0,
      totalHpp: Number(row.total_hpp) || 0,
      netProfit: Number(row.net_profit) || 0,
      paymentMethod: row.payment_method || 'TF',
      paymentStatus: row.payment_status || 'menunggu_konfirmasi',
      fulfillmentStatus: row.fulfillment_status || 'menunggu',
      paymentProofUrl: row.payment_proof_url || '',
      paymentProofUploadedAt: row.payment_proof_uploaded_at,
      paymentApprovedAt: row.payment_approved_at,
      paymentApprovedBy: row.payment_approved_by,
      customerNotes: row.customer_notes || '',
      adminNotes: row.admin_notes || '',
      greetingCard: row.greeting_card,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Supabase fetch orders failed:', err);
    return null;
  }
}

export async function upsertSupabaseOrder(order: Order): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const row = {
      id: order.id,
      order_number: order.orderNumber,
      order_date: order.orderDate,
      customer_name: order.customerName,
      customer_phone: order.customerPhone || null,
      order_type: order.orderType,
      delivery_address: order.deliveryAddress || null,
      delivery_time_note: order.deliveryTimeNote || null,
      priority: order.priority || 'normal',
      items: order.items,
      total_pcs: order.totalPcs,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee || 0,
      total_amount: order.totalAmount,
      total_hpp: order.totalHpp,
      net_profit: order.netProfit,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      fulfillment_status: order.fulfillmentStatus,
      payment_proof_url: order.paymentProofUrl || null,
      payment_proof_uploaded_at: order.paymentProofUploadedAt || null,
      payment_approved_at: order.paymentApprovedAt || null,
      payment_approved_by: order.paymentApprovedBy || null,
      customer_notes: order.customerNotes || null,
      admin_notes: order.adminNotes || null,
      greeting_card: order.greetingCard || null,
      created_at: order.createdAt || new Date().toISOString(),
    };

    const { error } = await supabase.from('orders').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase upsert order error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert order failed:', err);
    return false;
  }
}

// ---------------- PRODUCTS ---------------- //

export async function fetchSupabaseProducts(): Promise<Product[] | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.warn('Supabase fetch products warning:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline || '',
      description: row.description || '',
      price: Number(row.price) || 0,
      category: row.category || 'Gabin',
      image: row.image || '',
      badge: row.badge || '',
      isAvailable: row.is_available ?? true,
      recipe: row.recipe || [],
      customHpp: row.custom_hpp ? Number(row.custom_hpp) : undefined,
    }));
  } catch (err) {
    console.error('Supabase fetch products failed:', err);
    return null;
  }
}

export async function upsertSupabaseProduct(product: Product): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const row = {
      id: product.id,
      name: product.name,
      tagline: product.tagline || null,
      description: product.description || null,
      price: product.price,
      category: product.category || 'Gabin',
      image: product.image || null,
      badge: product.badge || null,
      is_available: product.isAvailable,
      recipe: product.recipe || [],
      custom_hpp: product.customHpp || null,
    };

    const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase upsert product error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert product failed:', err);
    return false;
  }
}

// ---------------- SYNC ALL ---------------- //

export async function syncLocalToSupabase(orders: Order[], products: Product[]): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, message: 'Supabase belum dikonfigurasi di file .env' };
  }

  try {
    for (const prod of products) {
      await upsertSupabaseProduct(prod);
    }
    for (const ord of orders) {
      await upsertSupabaseOrder(ord);
    }
    return { success: true, message: `Berhasil sinkronisasi ${products.length} produk dan ${orders.length} pesanan ke Supabase!` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal sinkronisasi ke Supabase' };
  }
}
