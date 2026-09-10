'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import OrderCalendar from '@/components/OrderCalendar';
import CheckoutModal from '@/components/CheckoutModal';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Clock, ShieldCheck, Sparkles, MessageCircle, AlertCircle, Trash2, Plus, Minus } from 'lucide-react';
import { format } from '@/lib/dateUtils';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function OrderPage() {
  const { state, total, updateQty, removeItem, clearCart } = useCart();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('afternoon');
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  const isReadyToCheckout = selectedDate !== null && Boolean(selectedSlot) && state.items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-white px-4 py-1.5 rounded-full border border-pink-200 text-xs font-bold text-[#E6007E] shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          <span>Strict Cutoff: Orders Close Day Before at 8:00 PM</span>
        </div>
        <h1 className="font-playfair text-4xl sm:text-5xl font-extrabold text-[#4A2C2A]">
          Reserve Your Bake Schedule
        </h1>
        <p className="text-xs sm:text-sm text-[#7A4C4A] leading-relaxed">
          Step 1: Pick your delivery date & time slot across Gujranwala. Step 2: Review your box contents. Step 3: Pre-order via WhatsApp or JazzCash advance transfer!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Calendar Date & Slot Picker */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-2xl font-bold text-[#4A2C2A] flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#4A2C2A] text-white text-xs flex items-center justify-center font-sans font-bold">
                1
              </span>
              <span>Select Date & Time Slot</span>
            </h2>
          </div>

          <OrderCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </div>

        {/* Right Column: Cart Review & Checkout Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-pink-200/80 p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
          <div className="flex items-center justify-between border-b border-pink-100 pb-4">
            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#4A2C2A] flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#E6007E] text-white text-xs flex items-center justify-center font-sans font-bold">
                2
              </span>
              <span>Review Pre-Order</span>
            </h2>
            {state.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {state.items.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-3xl mx-auto">
                🛒
              </div>
              <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">
                Your cart is empty
              </h3>
              <p className="text-xs text-[#7A4C4A] max-w-xs mx-auto">
                Please add some brownie boxes or cookies from our menu before finalizing your schedule.
              </p>
              <Link href="/menu" className="btn-primary text-xs py-2.5 px-6 inline-flex">
                Explore Bakery Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Itemized list with qty modifiers */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {state.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FFF5F9] rounded-2xl p-3.5 border border-pink-200/70 flex gap-3 items-center justify-between"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-semibold text-xs text-[#4A2C2A] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#7A4C4A]">
                        {item.variant} {item.flavor ? `• ${item.flavor}` : ''}
                      </p>
                      {item.customNote && (
                        <p className="text-[10px] text-[#E6007E] italic truncate mt-0.5">
                          &ldquo;{item.customNote}&rdquo;
                        </p>
                      )}
                      <p className="text-xs font-bold text-[#4A2C2A] mt-1">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-white rounded-full border border-pink-200 p-0.5 shadow-sm shrink-0">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-[#4A2C2A] hover:bg-pink-100 font-bold"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-[#4A2C2A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-[#4A2C2A] hover:bg-pink-100 font-bold"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total calculation */}
              <div className="bg-[#FFF5F9] p-4 rounded-2xl border border-pink-200 space-y-2">
                <div className="flex justify-between text-xs text-[#7A4C4A]">
                  <span>Order Subtotal:</span>
                  <span className="font-bold text-[#4A2C2A]">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#4A2C2A] pt-2 border-t border-pink-200">
                  <span>Grand Total:</span>
                  <span className="text-[#E6007E] font-playfair text-xl">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Step checklist alerts */}
              {!selectedDate ? (
                <div className="p-3 bg-pink-50 border border-pink-200 text-xs text-[#E6007E] rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Please pick an available bake date on the calendar.</span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl space-y-0.5">
                  <p className="font-bold">
                    📅 {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Slot: {selectedSlot ? selectedSlot.toUpperCase() : 'None'}
                  </p>
                </div>
              )}

              {/* Proceed Button */}
              <button
                type="button"
                disabled={!isReadyToCheckout}
                onClick={() => setShowCheckoutModal(true)}
                className="w-full btn-primary py-3.5 text-sm font-bold justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#25D366] hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Questions? Talk directly on WhatsApp (+92 370 6572463)</span>
                </a>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onClose={() => setShowCheckoutModal(false)}
        />
      )}

    </div>
  );
}
