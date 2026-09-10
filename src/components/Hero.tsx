'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, ArrowRight, MessageCircle, MapPin } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-pink-200 px-4 py-1.5 rounded-full shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6007E] animate-ping" />
              <span className="text-xs font-bold text-[#4A2C2A] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#E6007E]" />
                <span>Gujranwala • Max 15 Orders / Bake Day</span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#E6007E]" />
            </div>

            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#4A2C2A] leading-[1.15] tracking-tight">
              Small-Batch Brownies & Gourmet Bakes,{' '}
              <span className="text-[#E6007E] block sm:inline">
                Made with Pure Love.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#7A4C4A] leading-relaxed max-w-2xl font-normal">
              Indulge in Gujranwala&apos;s favorite handcrafted fudgy brownies, thick NYC-style cookies, golden banana muffins, and fresh banana loaves. Pick your bake date from our schedule calendar!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/order" className="btn-primary text-sm sm:text-base py-3.5 px-8">
                <Calendar className="w-4 h-4" />
                <span>Pre-Order from Calendar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link href="/menu" className="btn-secondary text-sm sm:text-base py-3.5 px-6">
                <span>View Full Menu & Prices</span>
              </Link>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-xs sm:text-sm py-3 px-5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <div className="pt-8 border-t border-pink-200/80 grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="font-playfair text-xl sm:text-2xl font-bold text-[#4A2C2A]">15 Orders</p>
                <p className="text-xs text-[#7A4C4A]">Max Daily Limit</p>
              </div>
              <div className="space-y-1 border-l border-pink-200 pl-4">
                <p className="font-playfair text-xl sm:text-2xl font-bold text-[#E6007E]">8:00 PM</p>
                <p className="text-xs text-[#7A4C4A]">Prior Day Cutoff</p>
              </div>
              <div className="space-y-1 border-l border-pink-200 pl-4">
                <p className="font-playfair text-xl sm:text-2xl font-bold text-[#4A2C2A]">Gujranwala</p>
                <p className="text-xs text-[#7A4C4A]">Local Fresh Delivery</p>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-white to-[#FFF5F9] rounded-3xl p-6 sm:p-8 border border-pink-200/80 shadow-xl card-hover">
              
              <div className="flex justify-between items-center mb-6">
                <span className="bg-[#E6007E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  ⭐ Top Pick
                </span>
                <span className="text-xs font-semibold text-[#7A4C4A]">
                  Fresh Weekly Batches
                </span>
              </div>

              <div className="h-44 sm:h-52 rounded-2xl bg-gradient-to-tr from-pink-100 to-pink-50 flex items-center justify-center relative overflow-hidden border border-pink-200/40">
                <span className="text-8xl sm:text-9xl transform hover:scale-110 transition-transform duration-300 select-none">
                  🍫
                </span>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-playfair text-xl font-bold text-[#4A2C2A]">
                    Artisanal Brownie Box
                  </h3>
                  <span className="text-sm font-bold text-[#E6007E]">
                    from Rs. 1,349
                  </span>
                </div>
                <p className="text-xs text-[#7A4C4A]">
                  Available in Box of 4, 6 & 9. Choose Chocolate Chip, Fudge, Salted Caramel or Cookies &apos;N Cream.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-pink-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#4A2C2A]">
                  🚚 Delivery across Gujranwala
                </span>
                <Link
                  href="/menu"
                  className="text-xs font-bold text-[#E6007E] hover:text-[#FF4DB2] flex items-center gap-1"
                >
                  <span>Select Flavors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="absolute -bottom-5 -left-5 bg-white p-3 rounded-2xl shadow-lg border border-pink-200 flex items-center gap-2.5 animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="text-2xl">🍪</span>
                <div>
                  <p className="text-[11px] font-bold text-[#4A2C2A]">NYC Cookies (Box of 6)</p>
                  <p className="text-[10px] font-bold text-[#E6007E]">from Rs. 1,199</p>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-lg border border-pink-200 flex items-center gap-2.5">
                <span className="text-2xl">🧁</span>
                <div>
                  <p className="text-[11px] font-bold text-[#4A2C2A]">Nutella Muffins (Box of 9)</p>
                  <p className="text-[10px] font-bold text-[#E6007E]">Rs. 1,549</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
