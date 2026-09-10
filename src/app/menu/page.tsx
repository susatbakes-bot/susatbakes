'use client';

import React from 'react';
import MenuSection from '@/components/MenuSection';
import { Sparkles, Calendar, MessageCircle, Heart, Info } from 'lucide-react';
import Link from 'next/link';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function MenuPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      
      {/* Menu Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-pink-200 text-xs font-bold text-[#E6007E] shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Handcrafted Small-Batch Bakery Menu</span>
        </div>
        <h1 className="font-playfair text-4xl sm:text-5xl font-extrabold text-[#4A2C2A]">
          Our Artisanal Menu & Pricing
        </h1>
        <p className="text-xs sm:text-sm text-[#7A4C4A] leading-relaxed">
          Every treat is made from scratch with pure Belgian cocoa, European butter, and organic vanilla. Choose your preferred box size and flavor below to add to cart!
        </p>
      </div>

      {/* Structured Pricing Overview Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Brownies Pricing Table */}
        <div className="bg-white rounded-3xl border border-pink-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-pink-100 pb-3">
            <span className="text-2xl">🍫</span>
            <div>
              <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">Brownies</h3>
              <p className="text-[10px] text-[#7A4C4A]">Box Size Options</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <span className="font-semibold text-[#4A2C2A]">Box of 4</span>
              <span className="font-bold text-[#E6007E]">Rs. 1,349</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <span className="font-semibold text-[#4A2C2A]">Box of 6</span>
              <span className="font-bold text-[#E6007E]">Rs. 1,849</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <span className="font-semibold text-[#4A2C2A]">Box of 9</span>
              <span className="font-bold text-[#E6007E]">Rs. 1,999</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-[#7A4C4A] leading-tight">
            <strong>Flavors:</strong> Chocolate Chip, Chocolate Fudge, Salted Caramel, Cookies &apos;N Cream.
          </div>
        </div>

        {/* Cookies Pricing Table */}
        <div className="bg-white rounded-3xl border border-pink-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-pink-100 pb-3">
            <span className="text-2xl">🍪</span>
            <div>
              <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">NYC Cookies</h3>
              <p className="text-[10px] text-[#7A4C4A]">Box of 4 & Box of 6</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <div>
                <span className="font-semibold text-[#4A2C2A] block">NYC Chocolate Chip</span>
                <span className="text-[10px] text-[#7A4C4A]">Box of 4: Rs. 1,349</span>
              </div>
              <span className="font-bold text-[#E6007E]">Box of 6: Rs. 1,980</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <div>
                <span className="font-semibold text-[#4A2C2A] block">Red Velvet</span>
                <span className="text-[10px] text-[#7A4C4A]">Box of 4: Rs. 1,599</span>
              </div>
              <span className="font-bold text-[#E6007E]">Box of 6: Rs. 2,149</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <div>
                <span className="font-semibold text-[#4A2C2A] block">Nutella Stuffed</span>
                <span className="text-[10px] text-[#7A4C4A]">Box of 4: Rs. 1,599</span>
              </div>
              <span className="font-bold text-[#E6007E]">Box of 6: Rs. 2,149</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <div>
                <span className="font-semibold text-[#4A2C2A] block">Lotus Biscoff</span>
                <span className="text-[10px] text-[#7A4C4A]">Box of 4: Rs. 1,880</span>
              </div>
              <span className="font-bold text-[#E6007E]">Box of 6: Rs. 2,349</span>
            </div>
          </div>
        </div>

        {/* Muffins & Breads Pricing Table */}
        <div className="bg-white rounded-3xl border border-pink-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-pink-100 pb-3">
            <span className="text-2xl">🧁</span>
            <div>
              <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">Muffins & Breads</h3>
              <p className="text-[10px] text-[#7A4C4A]">Batch & Loaf Sizes</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <div>
                <span className="font-semibold text-[#4A2C2A] block">Banana Muffins</span>
                <span className="text-[10px] text-[#7A4C4A]">Box of 9</span>
              </div>
              <span className="font-bold text-[#E6007E]">Rs. 1,449</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <div>
                <span className="font-semibold text-[#4A2C2A] block">Nutella Muffins</span>
                <span className="text-[10px] text-[#7A4C4A]">Box of 9</span>
              </div>
              <span className="font-bold text-[#E6007E]">Rs. 1,549</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#FFF5F9]">
              <div>
                <span className="font-semibold text-[#4A2C2A] block">Banana Bread</span>
                <span className="text-[10px] text-[#7A4C4A]">1.5 lb Loaf</span>
              </div>
              <span className="font-bold text-[#E6007E]">Rs. 1,549</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Products Grid */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-pink-200 pb-4">
          <div>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#4A2C2A]">
              Customize & Add to Cart
            </h2>
            <p className="text-xs text-[#7A4C4A]">
              Select options and click Add to Cart
            </p>
          </div>
          <Link href="/order" className="btn-primary text-xs py-2 px-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>Go to Calendar</span>
          </Link>
        </div>

        <MenuSection preview={false} />
      </div>

      {/* Bottom Help Banner */}
      <div className="bg-white rounded-3xl border border-pink-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="font-playfair text-xl font-bold text-[#4A2C2A]">
            Have a Custom Corporate or Bulk Order?
          </h3>
          <p className="text-xs text-[#7A4C4A]">
            For birthdays, weddings, or corporate gift boxes, connect directly with our head baker.
          </p>
        </div>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp text-xs py-3 px-6 shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
