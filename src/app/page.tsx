'use client';

import React from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import MenuSection from '@/components/MenuSection';
import { Sparkles, Calendar, Clock, CheckCircle2, ArrowRight, MessageCircle, Heart, ShieldCheck, Award, Flame, Leaf } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <Hero />

      {/* How Pre-Ordering Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-pink-200/80 p-8 sm:p-12 shadow-sm space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6007E] bg-pink-50 px-4 py-1.5 rounded-full border border-pink-200">
              Simple & Transparent
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#4A2C2A]">
              How Pre-Ordering Works in Gujranwala
            </h2>
            <p className="text-xs sm:text-sm text-[#7A4C4A]">
              We bake in micro-batches to guarantee that signature crackly brownie top and gooey center.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                emoji: '🍫',
                title: 'Choose Your Box',
                desc: 'Pick your brownie box sizes (4, 6, 9), NYC cookie flavors, or banana loaves.',
              },
              {
                step: '02',
                emoji: '📅',
                title: 'Pick a Bake Date',
                desc: 'Select from available calendar slots. We cap at 15 daily orders for highest quality.',
              },
              {
                step: '03',
                emoji: '⏰',
                title: 'Respect Cutoff Time',
                desc: 'Orders close at 8:00 PM the previous evening so our bakers can prep fresh dough.',
              },
              {
                step: '04',
                emoji: '📱',
                title: 'JazzCash / WhatsApp',
                desc: 'Advance payment via JazzCash (0308 4977958) or instant WhatsApp pre-order.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#FFF5F9] rounded-2xl p-6 border border-pink-200/70 space-y-3 relative group hover:border-[#E6007E] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{item.emoji}</span>
                  <span className="font-playfair text-xl font-extrabold text-pink-300 group-hover:text-[#E6007E] transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#7A4C4A] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Bestsellers Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6007E]">
              Fresh Out of the Oven
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#4A2C2A]">
              Our Signature Bestsellers
            </h2>
            <p className="text-xs sm:text-sm text-[#7A4C4A] max-w-xl">
              Choose your box size, favorite flavor, and add a custom gift note for your loved ones.
            </p>
          </div>

          <Link href="/menu" className="btn-secondary text-xs sm:text-sm py-2.5 px-6 shrink-0">
            <span>Explore All Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <MenuSection preview={true} />
      </section>

      {/* Schedule & Capacity Notice Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#4A2C2A] to-[#2E1A18] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#E6007E]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300 uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-[#E6007E]" />
                <span>Baking Schedule & Capacity Policy (Gujranwala)</span>
              </span>
              <h2 className="font-playfair text-2xl sm:text-4xl font-bold leading-tight">
                Freshness Takes Time. Reserve Your Bake Slot Today.
              </h2>
              <p className="text-xs sm:text-sm text-pink-100/85 leading-relaxed max-w-2xl">
                Every batch is limited to exactly 15 orders. Orders close strictly at 8:00 PM the evening before. Don&apos;t miss your weekend sweet tooth craving!
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link href="/order" className="btn-primary text-center justify-center py-3.5 text-sm shadow-xl">
                <Calendar className="w-4 h-4" />
                <span>Open Pre-Order Calendar</span>
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-center justify-center py-3.5 text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant WhatsApp Query</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bakery Quality Standards & Craftsmanship Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E6007E]">
            Our Baking Philosophy
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#4A2C2A]">
            The SusatBakes Quality Promise
          </h2>
          <p className="text-xs sm:text-sm text-[#7A4C4A]">
            Every batch baked in our Gujranwala kitchen follows strict artisanal standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-pink-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F9] flex items-center justify-center text-2xl text-[#E6007E] border border-pink-100">
              🍫
            </div>
            <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">
              100% Belgian Dark Chocolate
            </h3>
            <p className="text-xs text-[#7A4C4A] leading-relaxed">
              We never use compound chocolate or vegetable fat substitutes. Only pure cocoa solids and European butter for rich, intense fudge density.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-pink-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F9] flex items-center justify-center text-2xl text-[#E6007E] border border-pink-100">
              👩‍🍳
            </div>
            <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">
              Baked Fresh to Order
            </h3>
            <p className="text-xs text-[#7A4C4A] leading-relaxed">
              No stale shelf inventory. Every brownie box, cookie, and banana loaf is prepared on your selected bake date and delivered warm in Gujranwala.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-pink-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F9] flex items-center justify-center text-2xl text-[#E6007E] border border-pink-100">
              🌿
            </div>
            <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">
              Zero Artificial Preservatives
            </h3>
            <p className="text-xs text-[#7A4C4A] leading-relaxed">
              Clean, wholesome ingredients you can trust. Pure cane sugar, farm-fresh eggs, ripe Cavendish bananas, and Madagascar vanilla extract.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
