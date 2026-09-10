'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, MessageSquare } from 'lucide-react';

export default function CartDrawer() {
  const { state, closeCart, removeItem, updateQty, total, itemCount, clearCart } = useCart();

  if (!state.isOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={closeCart} />

      <div className="cart-drawer">
        
        <div className="p-5 sm:p-6 border-b border-pink-100 flex items-center justify-between bg-[#FDF0F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6007E] flex items-center justify-center text-white text-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#4A2C2A]">
                Your Pre-Order Cart
              </h2>
              <p className="text-[11px] text-[#7A4C4A]">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-white text-[#4A2C2A] transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {state.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-3xl">
                🧁
              </div>
              <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">Your Cart is Empty</h3>
              <p className="text-xs text-[#7A4C4A] max-w-xs leading-relaxed">
                Add some delicious brownies, cookies, or muffins from our menu to start your pre-order.
              </p>
              <button
                onClick={closeCart}
                className="btn-primary text-xs py-2.5 px-6 mt-2"
              >
                Browse Our Menu
              </button>
            </div>
          ) : (
            state.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFF5F9] border border-pink-200/80 rounded-2xl p-4 flex gap-3 items-start relative group"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shrink-0 border border-pink-100 shadow-sm">
                  {item.emoji || '🧁'}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="font-semibold text-sm text-[#4A2C2A] truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#7A4C4A]">
                    {item.variant} {item.flavor ? `• ${item.flavor}` : ''}
                  </p>
                  
                  {item.customNote && (
                    <p className="text-[11px] text-[#E6007E] italic flex items-center gap-1 mt-1 truncate">
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span>&ldquo;{item.customNote}&rdquo;</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-bold text-[#4A2C2A]">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1 bg-white rounded-full border border-pink-200 p-0.5 shadow-sm">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-[#4A2C2A] hover:bg-pink-100 transition-colors font-bold"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-[#4A2C2A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-[#4A2C2A] hover:bg-pink-100 transition-colors font-bold"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {state.items.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-pink-100 bg-[#FDF0F5] space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#7A4C4A]">
                <span>Items Subtotal:</span>
                <span className="font-bold text-[#4A2C2A]">Rs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-[#4A2C2A] pt-2 border-t border-pink-200">
                <span>Estimated Total:</span>
                <span className="text-[#E6007E] font-playfair text-xl">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/order"
                onClick={closeCart}
                className="btn-primary w-full py-3.5 text-center text-sm font-bold justify-center"
              >
                <span>Select Bake Date & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-between text-[11px] text-[#7A4C4A] px-1">
                <span>📦 Delivery across Karachi</span>
                <button
                  onClick={clearCart}
                  className="hover:text-red-500 hover:underline transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
