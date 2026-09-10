import { CartItem } from '@/types/bakery';

export const WHATSAPP_NUMBER = '923706572463';
export const JAZZCASH_NUMBER = '0308 4977958';

export type WhatsAppOrderPayload = {
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  date: string;
  slot: string;
  items: CartItem[];
  total: number;
  paymentType?: string;
  notes?: string;
};

const SLOT_MAP: Record<string, string> = {
  morning: 'Morning Slot (9:00 AM – 12:00 PM)',
  afternoon: 'Afternoon Slot (12:00 PM – 5:00 PM)',
  evening: 'Evening Slot (5:00 PM – 8:00 PM)',
};

export function formatWhatsAppMessage(order: WhatsAppOrderPayload): string {
  const slotName = SLOT_MAP[order.slot.toLowerCase()] || order.slot;

  const itemLines = order.items.map((item, index) => {
    const flavorStr = item.flavor ? ` [Flavor: ${item.flavor}]` : '';
    const noteStr = item.customNote ? `\n    ↳ Note: "${item.customNote}"` : '';
    return `${index + 1}. *${item.name}* (${item.variant}${flavorStr})\n    Qty: ${item.quantity} × Rs. ${item.price.toLocaleString()} = *Rs. ${(item.price * item.quantity).toLocaleString()}*${noteStr}`;
  });

  const lines: string[] = [
    '🧁 *NEW PRE-ORDER — SUSATBAKES (GUJRANWALA)*',
    '─────────────────────────',
    `👤 *Customer:* ${order.customerName}`,
    `📞 *Phone / WhatsApp:* ${order.phone}`,
  ];

  if (order.email) {
    lines.push(`📧 *Email:* ${order.email}`);
  }

  lines.push(
    `📍 *Delivery Address (Gujranwala):* ${order.address}`,
    '',
    `📅 *Bake Date:* ${order.date}`,
    `⏰ *Time Slot:* ${slotName}`,
    '',
    '🛒 *Order Items:*',
    ...itemLines,
    '─────────────────────────',
    `💰 *TOTAL AMOUNT: Rs. ${order.total.toLocaleString()}*`,
    '',
    `💳 *Payment:* ${order.paymentType === 'jazzcash' ? `JazzCash Advance Transfer (${JAZZCASH_NUMBER})` : 'WhatsApp Pre-Order'}`
  );

  if (order.notes && order.notes.trim()) {
    lines.push(`📝 *Special Instructions:* ${order.notes.trim()}`);
  }

  lines.push('', '✨ _Thank you for ordering with @susatbakes! Please reply to confirm this bake slot._');

  return lines.join('\n');
}

export function buildWhatsAppUrl(order: WhatsAppOrderPayload): string {
  const text = formatWhatsAppMessage(order);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
