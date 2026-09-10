'use client';

import React, { useState } from 'react';
import { BakeryProduct, BoxOption } from '@/types/bakery';
import { useCart } from '@/context/CartContext';
import { computeProductPricing } from '@/lib/wordpress';
import { Plus, Check, Sparkles, MessageSquare } from 'lucide-react';

export type ProductCardProps = {
  product: BakeryProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  // Compute pricing offsets and box options dynamically
  const pricing = computeProductPricing(product);
  const boxOptions: BoxOption[] = pricing.boxOptions || product.boxOptions || [];
  const isSingleOption = pricing.isSingleOption || boxOptions.length === 0;

  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number>(0);
  const [customNote, setCustomNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);

  // Dynamic price and variant calculation
  let currentPrice = pricing.basePrice;
  let variantLabel = pricing.fixedVariant || 'Standard';

  if (!isSingleOption && boxOptions.length > 0) {
    const selectedBox = boxOptions[selectedBoxIndex] || boxOptions[0];
    currentPrice = selectedBox.price;
    variantLabel = selectedBox.label;
  } else if (pricing.fixedPrice !== undefined) {
    currentPrice = pricing.fixedPrice;
    variantLabel = pricing.fixedVariant || 'Standard';
  }

  const cartItemId = [
    product.id,
    variantLabel,
    customNote.trim() ? customNote.trim().slice(0, 15) : '',
  ]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-');

  const handleAddToCart = () => {
    addItem({
      id: cartItemId,
      productId: product.id,
      name: product.name,
      category: pricing.categoryName || product.category,
      variant: variantLabel,
      price: currentPrice,
      quantity: 1,
      customNote: customNote.trim() || undefined,
      emoji: product.emoji,
      imageUrl: product.imageUrl,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      
      <div className="h-44 sm:h-48 bg-gradient-to-br from-[#FFF5F9] via-[#FDF0F5] to-pink-100/70 flex items-center justify-center relative border-b border-pink-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Graceful fallback if image URL fails to load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-7xl sm:text-8xl transform group-hover:scale-110 transition-transform duration-300 select-none">
            {product.emoji}
          </span>
        )}

        {product.tag && (
          <span className="absolute top-4 left-4 bg-[#E6007E] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
            <Sparkles className="w-3 h-3" />
            <span>{product.tag}</span>
          </span>
        )}

        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#4A2C2A] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-pink-200 z-10">
          {product.category}
        </span>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          <h3 className="font-playfair text-xl font-bold text-[#4A2C2A] group-hover:text-[#E6007E] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-[#7A4C4A] mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Interactive Box Size Selection (Brownies & NYC Cookies) */}
        {!isSingleOption && boxOptions.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#4A2C2A] flex items-center justify-between">
              <span>Select Box Size:</span>
              <span className="text-[10px] font-normal text-[#7A4C4A]">Dynamic Pricing</span>
            </label>
            <div className={`grid gap-2 ${boxOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {boxOptions.map((opt, i) => {
                const active = selectedBoxIndex === i;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedBoxIndex(i)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center ${
                      active
                        ? 'bg-[#4A2C2A] text-white border-[#4A2C2A] shadow-sm ring-2 ring-[#E6007E]/30'
                        : 'bg-[#FFF5F9] border-pink-200 text-[#4A2C2A] hover:border-[#4A2C2A]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className={`text-[10px] font-bold ${active ? 'text-pink-200' : 'text-[#E6007E]'}`}>
                      Rs. {opt.price.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Fixed Single-Option Indicator (Muffins & Breads) */
          <div className="pt-1">
            <div className="bg-[#FFF5F9] border border-pink-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-[#7A4C4A] font-medium">Fixed Packaging:</span>
              <span className="font-bold text-[#4A2C2A] bg-white px-2.5 py-0.5 rounded-md border border-pink-100">
                {pricing.fixedVariant || 'Batch Item'}
              </span>
            </div>
          </div>
        )}

        <div className="pt-1">
          {!showNoteInput ? (
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="text-[11px] font-semibold text-[#7A4C4A] hover:text-[#E6007E] flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>+ Add Gift Message / Custom Note</span>
            </button>
          ) : (
            <div className="space-y-1 animate-fade-in">
              <label className="text-[10px] font-semibold text-[#7A4C4A] flex justify-between">
                <span>Gift Note for this item:</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteInput(false);
                    setCustomNote('');
                  }}
                  className="text-red-500 hover:underline"
                >
                  Cancel
                </button>
              </label>
              <input
                type="text"
                placeholder="e.g. Happy Birthday Sarah! 💕"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-xl border border-pink-200 bg-[#FFF5F9] focus:outline-none focus:border-[#E6007E]"
              />
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-pink-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] text-[#7A4C4A] block">{variantLabel}</span>
            <span className="font-playfair text-xl font-bold text-[#4A2C2A]">
              Rs. {currentPrice.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-md ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-[#E6007E] hover:bg-[#FF4DB2] text-white active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export const MenuCard = ProductCard;
export default ProductCard;
