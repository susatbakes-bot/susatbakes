import React from 'react';
import Link from 'next/link';
import { MessageCircle, Calendar, Heart, ShieldCheck } from 'lucide-react';
import { WHATSAPP_NUMBER, JAZZCASH_NUMBER } from '@/lib/whatsapp';

export default function Footer() {
  return (
    <footer className="bg-[#4A2C2A] text-[#FDF0F5] mt-20 border-t-4 border-[#E6007E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6007E] flex items-center justify-center text-white shadow-md">
                <span className="text-xl">🧁</span>
              </div>
              <div>
                <h3 className="font-playfair text-2xl font-bold text-white">susatbakes</h3>
                <p className="text-xs text-pink-300 font-semibold tracking-wider">@susatbakes • Gujranwala</p>
              </div>
            </div>
            <p className="text-xs text-pink-100/80 leading-relaxed">
              Handcrafted home bakery baking small batches of ultra-fudgy brownies, NYC cookies, and artisanal breads in Gujranwala.
            </p>
            <div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#20bd5a] transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +92 370 657 2463</span>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-playfair text-lg font-bold text-white">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-pink-200">
              <li>
                <Link href="/" className="hover:text-white hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-white hover:underline transition-colors">
                  Full Menu & Prices
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-white hover:underline transition-colors">
                  Pre-Order Schedule Calendar
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-playfair text-lg font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#E6007E]" />
              <span>Pre-Order Schedule</span>
            </h4>
            <ul className="space-y-2 text-xs text-pink-100/80">
              <li className="flex items-start gap-2">
                <span className="text-[#E6007E] font-bold">•</span>
                <span><strong>Gujranwala Only:</strong> Local delivery across Gujranwala.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E6007E] font-bold">•</span>
                <span><strong>Daily Capacity:</strong> Max 15 orders per bake day to ensure peak quality.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E6007E] font-bold">•</span>
                <span><strong>Cutoff Window:</strong> Orders close the day before at 8:00 PM sharp.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-playfair text-lg font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E6007E]" />
              <span>Advance Payment Policy</span>
            </h4>
            <p className="text-xs text-pink-100/80 leading-relaxed">
              We operate exclusively on advance payment via <strong>JazzCash (${JAZZCASH_NUMBER})</strong> and direct WhatsApp pre-orders. No Cash on Delivery (COD) is available.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="bg-[#E6007E]/30 px-2.5 py-1 rounded-md text-pink-200 border border-[#E6007E]/50">
                JazzCash: ${JAZZCASH_NUMBER}
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-md text-pink-200">
                WhatsApp Orders
              </span>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-pink-300">
          <p>© {new Date().getFullYear()} SusatBakes (@susatbakes). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Baked fresh with <Heart className="w-3.5 h-3.5 text-[#E6007E] fill-[#E6007E]" /> in Gujranwala, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
