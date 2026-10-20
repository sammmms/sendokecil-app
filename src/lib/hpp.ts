import { HPPComponent, Product, OrderItem } from '@/types';

export function calculateProductHpp(product: Product, components: HPPComponent[]): number {
  if (product.customHpp !== undefined && product.customHpp > 0) {
    return product.customHpp;
  }
  const componentMap = new Map<string, HPPComponent>(components.map((c) => [c.id, c]));
  let total = 0;
  for (const recipeItem of product.recipe) {
    const comp = componentMap.get(recipeItem.componentId);
    if (comp) {
      total += comp.cost * (recipeItem.quantity || 1);
    }
  }
  return total;
}

export function calculateOrderHpp(items: OrderItem[], products: Product[], components: HPPComponent[]): number {
  const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));
  let totalHpp = 0;

  for (const item of items) {
    if (item.calculatedHpp !== undefined && item.calculatedHpp > 0) {
      totalHpp += item.calculatedHpp * item.quantity;
      continue;
    }
    const product = productMap.get(item.productId);
    const itemHpp = product ? calculateProductHpp(product, components) : 9500;
    totalHpp += itemHpp * item.quantity;
  }

  return totalHpp;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}
