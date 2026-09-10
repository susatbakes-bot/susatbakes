// Updated DB module for Vercel read‑only filesystem
import fs from 'fs';
import path from 'path';
import { Order } from '@/types/bakery';

const DB_PATH = path.join(process.cwd(), 'data', 'orders.json');

type DBData = {
  orders: Order[];
};

// No‑op directory creation – Vercel file system is read‑only
function ensureDir() {
  // intentionally left blank
}

export function readDB(): DBData {
  // Return empty DB if file does not exist (no write attempt)
  if (!fs.existsSync(DB_PATH)) {
    return { orders: [] };
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw) as DBData;
  } catch (err) {
    console.error('Error reading orders DB:', err);
    return { orders: [] };
  }
}

export function writeDB(_data: DBData): void {
  // Disabled write in read‑only environment
  console.warn('writeDB called but filesystem is read‑only; operation ignored.');
}

export function getAllOrders(): Order[] {
  return readDB().orders;
}

export function getOrdersByDate(date: string): Order[] {
  const db = readDB();
  return db.orders.filter((o) => o.date === date);
}

export function addOrder(order: Order): void {
  // No persistence; optionally could push to in‑memory array
  const db = readDB();
  db.orders.unshift(order);
  writeDB(db);
}

export function updateOrderStatus(orderId: string, status: Order['status']): boolean {
  const db = readDB();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return false;
  order.status = status;
  writeDB(db);
  return true;
}

// Duplicate DB block removed

// Legacy DB code removed
