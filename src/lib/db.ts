import { neon } from '@neondatabase/serverless';
import { Order } from '@/types/bakery';

// In-memory fallback if Postgres is not configured (e.g., in local dev without env vars)
const inMemoryOrders: Order[] = [];

function getDbConnectionString(): string | null {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL ||
    null
  );
}

function getSql() {
  const connStr = getDbConnectionString();
  if (!connStr) {
    return null;
  }
  return neon(connStr);
}

let isTableInitialized = false;

export async function ensureOrdersTable(): Promise<void> {
  if (isTableInitialized) return;
  const sql = getSql();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        slot VARCHAR(50) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        items JSONB NOT NULL,
        total NUMERIC NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        receipt_url TEXT,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    isTableInitialized = true;
  } catch (err) {
    console.error('Failed to ensure orders table in Postgres:', err);
  }
}

function mapRowToOrder(row: any): Order {
  let parsedItems = [];
  try {
    parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
  } catch {
    parsedItems = [];
  }

  return {
    id: row.id,
    date: row.date || '',
    slot: row.slot || 'standard',
    customer: {
      name: row.customer_name || row.customer?.name || '',
      email: row.customer_email || row.customer?.email || '',
      phone: row.phone || row.customer_phone || row.customer?.phone || '',
      address: row.address || row.customer_address || row.customer?.address || '',
    },
    items: parsedItems,
    total: Number(row.total || 0),
    paymentType: (row.payment_method || row.payment_type || row.paymentType || 'whatsapp') as 'whatsapp' | 'jazzcash',
    proofUrl: row.receipt_url || row.proof_url || row.proofUrl || undefined,
    notes: row.notes || undefined,
    status: (row.status || 'Pending') as Order['status'],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function getAllOrders(): Promise<Order[]> {
  const sql = getSql();
  if (sql) {
    await ensureOrdersTable();
    try {
      const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC;`;
      return rows.map(mapRowToOrder);
    } catch (err) {
      console.error('Error fetching orders from Postgres:', err);
      return [];
    }
  }

  return [...inMemoryOrders];
}

export async function getOrdersByDate(date: string): Promise<Order[]> {
  const sql = getSql();
  if (sql) {
    await ensureOrdersTable();
    try {
      const rows = await sql`SELECT * FROM orders WHERE date = ${date} ORDER BY created_at DESC;`;
      return rows.map(mapRowToOrder);
    } catch (err) {
      console.error('Error fetching orders by date from Postgres:', err);
      return [];
    }
  }

  return inMemoryOrders.filter((o) => o.date === date);
}

export async function addOrder(order: Order): Promise<void> {
  const sql = getSql();
  if (sql) {
    await ensureOrdersTable();
    const itemsJson = JSON.stringify(order.items);
    await sql`
      INSERT INTO orders (
        id,
        date,
        slot,
        customer_name,
        customer_email,
        phone,
        address,
        items,
        total,
        payment_method,
        receipt_url,
        notes,
        status,
        created_at
      ) VALUES (
        ${order.id},
        ${order.date},
        ${order.slot},
        ${order.customer.name},
        ${order.customer.email},
        ${order.customer.phone},
        ${order.customer.address},
        ${itemsJson}::jsonb,
        ${order.total},
        ${order.paymentType},
        ${order.proofUrl || null},
        ${order.notes || null},
        ${order.status || 'Pending'},
        ${order.createdAt || new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        date = EXCLUDED.date,
        slot = EXCLUDED.slot,
        customer_name = EXCLUDED.customer_name,
        customer_email = EXCLUDED.customer_email,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        items = EXCLUDED.items,
        total = EXCLUDED.total,
        payment_method = EXCLUDED.payment_method,
        receipt_url = EXCLUDED.receipt_url,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status;
    `;
    return;
  }

  // Fallback in-memory store
  const existingIdx = inMemoryOrders.findIndex((o) => o.id === order.id);
  if (existingIdx >= 0) {
    inMemoryOrders[existingIdx] = order;
  } else {
    inMemoryOrders.unshift(order);
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  const sql = getSql();
  if (sql) {
    await ensureOrdersTable();
    try {
      await sql`UPDATE orders SET status = ${status} WHERE id = ${orderId};`;
      return true;
    } catch (err) {
      console.error('Error updating order status in Postgres:', err);
      return false;
    }
  }

  const order = inMemoryOrders.find((o) => o.id === orderId);
  if (!order) return false;
  order.status = status;
  return true;
}

