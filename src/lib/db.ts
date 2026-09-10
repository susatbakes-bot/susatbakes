import fs from 'fs';
import path from 'path';
import { Order } from '@/types/bakery';

const DB_PATH = path.join(process.cwd(), 'data', 'orders.json');

type DBData = {
  orders: Order[];
};

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readDB(): DBData {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const initial: DBData = { orders: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw) as DBData;
  } catch (err) {
    console.error('Error reading orders DB:', err);
    return { orders: [] };
  }
}

export function writeDB(data: DBData): void {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export function getAllOrders(): Order[] {
  return readDB().orders;
}

export function getOrdersByDate(date: string): Order[] {
  const db = readDB();
  return db.orders.filter((o) => o.date === date);
}

export function addOrder(order: Order): void {
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
