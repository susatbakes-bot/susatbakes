import { NextRequest, NextResponse } from 'next/server';
import {
  addOrder,
  getAllOrders,
  getOrdersByDate,
  updateOrderStatus,
} from '@/lib/db';
import {
  MAX_ORDERS_PER_DAY,
  isCutoffPassed,
  getRemainingCapacity,
  getCutoffLabel,
  isWithin24Hours,
} from '@/lib/capacity';
import { Order } from '@/types/bakery';
import { sendOrderEmails } from '@/lib/email';

// GET /api/orders or /api/orders?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    // If date query parameter provided, return capacity stats for that date
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: 'Invalid date format. Expected YYYY-MM-DD.' },
          { status: 400 }
        );
      }

      const existingOrders = await getOrdersByDate(date);
      const count = existingOrders.length;
      const remaining = Math.max(0, MAX_ORDERS_PER_DAY - count);
      const cutoffPassed = isCutoffPassed(date);
      const cutoffLabel = getCutoffLabel(date);
      const isAvailable = !cutoffPassed && remaining > 0;

      return NextResponse.json({
        date,
        count,
        maxCapacity: MAX_ORDERS_PER_DAY,
        remaining,
        isCutoffPassed: cutoffPassed,
        isAvailable,
        cutoffLabel,
      });
    }

    // Otherwise return all orders (for admin)
    const all = await getAllOrders();
    return NextResponse.json({ orders: all });
  } catch (err: any) {
    console.error('GET /api/orders error:', err);
    return NextResponse.json({ error: 'Failed to retrieve orders.' }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, slot, customer, items, total, paymentType, proofUrl, notes } = body;

    // Validation
    if (!date || !slot || !customer || !items || !total || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required order fields (date, slot, customer, items, total, paymentType).' },
        { status: 400 }
      );
    }

    if (!customer.name || !customer.phone || !customer.address || !customer.email) {
      return NextResponse.json(
        { error: 'Customer name, email, phone, and address are required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item.' },
        { status: 400 }
      );
    }

    // Enforce 24‑hour advance booking rule
    if (isWithin24Hours(date)) {
      return NextResponse.json(
        { error: 'Orders must be placed at least 24 hours in advance.' },
        { status: 400 }
      );
    }

    // Enforce 15 orders/day capacity
    const remaining = await getRemainingCapacity(date);
    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'Sorry! This bake day is fully booked (max 15 orders reached).' },
        { status: 409 }
      );
    }

    // Enforce cutoff time
    if (isCutoffPassed(date)) {
      return NextResponse.json(
        { error: 'Order cutoff for this date has closed (closes day before at 8:00 PM).' },
        { status: 409 }
      );
    }

    const newOrder: Order = {
      id: `SB-${Date.now().toString().slice(-6)}`,
      date,
      slot,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      items,
      total: Number(total),
      paymentType,
      proofUrl,
      notes,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    // Save order into Postgres database
    await addOrder(newOrder);

    // Send confirmation emails to customer and alert to admin
    try {
      await sendOrderEmails(newOrder);
    } catch (emailErr) {
      console.error('Email dispatch error (non-blocking):', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        orderId: newOrder.id,
        message: 'Pre-order placed successfully!',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while saving order.' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders - update status
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required.' }, { status: 400 });
    }
    const updated = await updateOrderStatus(orderId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Status updated.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update order status.' }, { status: 500 });
  }
}

