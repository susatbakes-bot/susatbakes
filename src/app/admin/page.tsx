'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types/bakery';
import { format } from '@/lib/dateUtils';
import { RefreshCw, Filter, Calendar, CheckCircle2, Clock, Truck, Eye, X, MessageCircle, FileText } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterType === 'all') return o.status !== 'Delivered';
    if (filterType === 'delivered') return o.status === 'Delivered';
    // existing payment type filters should exclude delivered orders
    return o.paymentType === filterType && o.status !== 'Delivered';
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E6007E]">
            Bakery Operations • Gujranwala
          </span>
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#4A2C2A]">
            SusatBakes Order Dashboard
          </h1>
          <p className="text-xs text-[#7A4C4A] mt-1">
            Live tracker for all WhatsApp pre-orders and JazzCash advance payments in Gujranwala.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-pink-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-[#7A4C4A]">Total Pre-Orders</p>
          <p className="font-playfair text-2xl font-bold text-[#4A2C2A]">{orders.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-pink-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-[#7A4C4A]">JazzCash Transfers</p>
          <p className="font-playfair text-2xl font-bold text-[#E6007E]">
            {orders.filter((o) => o.paymentType === 'jazzcash').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-pink-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-[#7A4C4A]">WhatsApp Orders</p>
          <p className="font-playfair text-2xl font-bold text-[#25D366]">
            {orders.filter((o) => o.paymentType === 'whatsapp').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-pink-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-[#7A4C4A]">Total Revenue Pipeline</p>
          <p className="font-playfair text-2xl font-bold text-[#4A2C2A]">
            Rs. {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-pink-200">
          {['all', 'whatsapp', 'jazzcash', 'delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                filterType === tab
                  ? 'bg-[#4A2C2A] text-white shadow-sm'
                  : 'text-[#4A2C2A] hover:bg-pink-50'
              }`}
            >
              {tab === 'jazzcash' ? 'JazzCash' : tab}
            </button>
          ))}
        </div>

        <p className="text-xs text-[#7A4C4A]">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-pink-200 overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <span className="text-4xl">📦</span>
            <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">No orders found</h3>
            <p className="text-xs text-[#7A4C4A]">
              Pre-orders placed on the site or via API will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF5F9] border-b border-pink-100 text-[#4A2C2A] uppercase font-bold tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Bake Date & Slot</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Proof</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100 text-[#4A2C2A]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-pink-50/50 transition-colors">
                    
                    <td className="py-3.5 px-4 font-bold text-[#E6007E]">
                      #{order.id}
                      <span className="block text-[10px] text-[#7A4C4A] font-normal">
                        {order.createdAt ? format(new Date(order.createdAt), 'MMM d, h:mm a') : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold">
                      <div>{order.date}</div>
                      <span className="text-[10px] uppercase font-bold text-[#E6007E] bg-pink-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {order.slot}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="font-bold">{order.customer.name}</p>
                      {order.customer.email && (
                        <a
                          href={`mailto:${order.customer.email}`}
                          className="text-[10px] text-[#E6007E] hover:underline block"
                        >
                          {order.customer.email}
                        </a>
                      )}
                      <a
                        href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] hover:underline font-semibold block"
                      >
                        {order.customer.phone}
                      </a>
                      <p className="text-[10px] text-[#7A4C4A] truncate max-w-xs">{order.customer.address}</p>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-[11px]">
                          <strong>{it.quantity}×</strong> {it.name} ({it.variant}{it.flavor ? `, ${it.flavor}` : ''})
                          {it.customNote && (
                            <span className="block text-[10px] text-[#E6007E] italic">&ldquo;{it.customNote}&rdquo;</span>
                          )}
                        </div>
                      ))}
                      {order.notes && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded">
                          Note: {order.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold font-playfair text-sm">
                      Rs. {order.total.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize inline-block ${
                          order.paymentType === 'whatsapp'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {order.paymentType === 'jazzcash' ? 'JazzCash Advance' : 'WhatsApp'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {order.proofUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProofUrl(order.proofUrl || null)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E6007E] hover:underline bg-pink-50 px-2 py-1 rounded-lg border border-pink-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status || 'Pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className="text-[11px] font-semibold bg-white border border-pink-200 rounded-xl px-2 py-1 focus:outline-none focus:border-[#E6007E]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Baking">Baking</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Proof Preview Modal */}
      {selectedProofUrl && (
        <div className="cart-overlay flex items-center justify-center p-4" onClick={() => setSelectedProofUrl(null)}>
          <div
            className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">
                JazzCash Transfer Receipt Screenshot
              </h3>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="p-1 rounded-full hover:bg-pink-50 text-[#4A2C2A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-pink-200 bg-[#FFF5F9] p-2 flex items-center justify-center">
              {selectedProofUrl.endsWith('.pdf') ? (
                <div className="text-center py-8 space-y-2">
                  <FileText className="w-12 h-12 text-[#E6007E] mx-auto" />
                  <p className="text-xs font-bold text-[#4A2C2A]">PDF Receipt Document</p>
                  <a
                    href={selectedProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-2 px-4 inline-flex"
                  >
                    Open PDF in New Tab
                  </a>
                </div>
              ) : (
                <img
                  src={selectedProofUrl}
                  alt="Payment Receipt"
                  className="max-w-full h-auto rounded-xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
