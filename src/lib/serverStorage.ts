import fs from 'fs';
import path from 'path';
import { HPPComponent, Order, Product, StoreConfig } from '@/types';
import { SEED_ORDERS } from '@/data/seedOrders';
import { INITIAL_HPP_COMPONENTS, INITIAL_PRODUCTS, STORE_CONFIG } from './constants';
import { calculateOrderHpp, calculateProductHpp } from './hpp';

interface DatabaseSchema {
  orders: Order[];
  products: Product[];
  hppComponents: HPPComponent[];
  config: StoreConfig;
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Memory cache to prevent repetitive disk reads
let memoryDb: DatabaseSchema | null = null;

function ensureDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.orders)) {
        memoryDb = parsed;
        return memoryDb!;
      }
    }
  } catch (err) {
    console.error('Failed reading db.json, reinitializing default data:', err);
  }

  // Initialize fresh DB from seeds
  const initialDb: DatabaseSchema = {
    orders: SEED_ORDERS,
    products: INITIAL_PRODUCTS,
    hppComponents: INITIAL_HPP_COMPONENTS,
    config: STORE_CONFIG,
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write db.json:', e);
  }

  memoryDb = initialDb;
  return memoryDb;
}

function persistDb(data: DatabaseSchema): void {
  data.lastUpdated = new Date().toISOString();
  memoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// ---------------- ORDERS ---------------- //

export function getOrders(): Order[] {
  const db = ensureDb();
  return db.orders;
}

export function getOrderById(id: string): Order | undefined {
  const db = ensureDb();
  return db.orders.find((o) => o.id === id || o.orderNumber === id);
}

export function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'orderNumber' | 'totalHpp' | 'netProfit'>): Order {
  const db = ensureDb();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = db.orders.filter((o) => o.id.includes(dateStr)).length + 1;
  const newId = `SK-${dateStr}-${String(countToday).padStart(3, '0')}`;
  const orderNumber = `SK-${String(countToday).padStart(3, '0')}`;

  const totalHpp = calculateOrderHpp(orderData.items, db.products, db.hppComponents);
  const netProfit = orderData.totalAmount - totalHpp - (orderData.deliveryFee || 0);

  const newOrder: Order = {
    ...orderData,
    id: newId,
    orderNumber,
    createdAt: new Date().toISOString(),
    totalHpp,
    netProfit,
  };

  db.orders = [newOrder, ...db.orders];
  persistDb(db);
  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const db = ensureDb();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const current = db.orders[index];
  const updated: Order = {
    ...current,
    ...updates,
  };

  // Recalculate financial numbers if items or amounts changed
  if (updates.items || updates.totalAmount) {
    updated.totalHpp = calculateOrderHpp(updated.items, db.products, db.hppComponents);
    updated.netProfit = updated.totalAmount - updated.totalHpp - (updated.deliveryFee || 0);
  }

  db.orders[index] = updated;
  persistDb(db);
  return updated;
}

export function deleteOrder(id: string): boolean {
  const db = ensureDb();
  const initialLength = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== id);
  if (db.orders.length !== initialLength) {
    persistDb(db);
    return true;
  }
  return false;
}

// ---------------- PRODUCTS ---------------- //

export function getProducts(): Product[] {
  const db = ensureDb();
  return db.products;
}

export function saveProduct(product: Product): Product {
  const db = ensureDb();
  const index = db.products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    db.products[index] = product;
  } else {
    db.products.push(product);
  }
  persistDb(db);
  return product;
}

export function deleteProduct(id: string): boolean {
  const db = ensureDb();
  const beforeLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== beforeLen) {
    persistDb(db);
    return true;
  }
  return false;
}

// ---------------- HPP COMPONENTS ---------------- //

export function getHppComponents(): HPPComponent[] {
  const db = ensureDb();
  return db.hppComponents;
}

export function saveHppComponent(comp: HPPComponent): HPPComponent {
  const db = ensureDb();
  const index = db.hppComponents.findIndex((c) => c.id === comp.id);
  if (index >= 0) {
    db.hppComponents[index] = comp;
  } else {
    db.hppComponents.push(comp);
  }

  // Recalculate HPP for all orders with fresh components
  for (const ord of db.orders) {
    ord.totalHpp = calculateOrderHpp(ord.items, db.products, db.hppComponents);
    ord.netProfit = ord.totalAmount - ord.totalHpp - (ord.deliveryFee || 0);
  }

  persistDb(db);
  return comp;
}

export function deleteHppComponent(id: string): boolean {
  const db = ensureDb();
  const initialLength = db.hppComponents.length;
  db.hppComponents = db.hppComponents.filter((c) => c.id !== id);
  if (db.hppComponents.length !== initialLength) {
    persistDb(db);
    return true;
  }
  return false;
}

// ---------------- CONFIG ---------------- //

export function getStoreConfig(): StoreConfig {
  const db = ensureDb();
  return db.config;
}
