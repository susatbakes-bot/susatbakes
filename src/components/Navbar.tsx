'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X, Sparkles, MessageCircle, Calendar } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function Navbar() {
  const { itemCount, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu & Prices' },
    { href: '/order', label: 'Pre-Order Calendar' },
  ];

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FDF0F5]/95 backdrop-blur-md shadow-sm py-3 border-b border-pink-100'
          : 'bg-[#FDF0F5] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E6007E] to-[#FF4DB2] flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🧁</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-playfair text-xl sm:text-2xl font-bold tracking-tight text-[#4A2C2A] group-hover:text-[#E6007E] transition-colors">
                  susatbakes
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#E6007E] animate-pulse" />
              </div>
              <p className="text-[10px] uppercase font-semibold tracking-widest text-[#7A4C4A]">
                @susatbakes • Gujranwala
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-pink-200/60 shadow-sm">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#4A2C2A] text-white shadow-sm'
                      : 'text-[#4A2C2A] hover:text-[#E6007E] hover:bg-pink-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#25D366] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-full transition-colors"
              title="Chat with SusatBakes on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Us</span>
            </a>

            <Link
              href="/order"
              className="hidden lg:inline-flex btn-primary !py-2 !px-4 text-xs font-bold"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Pre-Order</span>
            </Link>

            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-2xl bg-white border border-pink-200 text-[#4A2C2A] hover:text-[#E6007E] hover:border-[#E6007E] transition-all shadow-sm active:scale-95 flex items-center justify-center"
              aria-label="Open Cart Drawer"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E6007E] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-white border border-pink-200 text-[#4A2C2A] hover:bg-pink-50 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-4 border-t border-pink-200/60 bg-white/95 rounded-3xl p-5 shadow-xl space-y-3 animate-fade-in border">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                      active
                        ? 'bg-[#4A2C2A] text-white'
                        : 'text-[#4A2C2A] hover:bg-pink-50 hover:text-[#E6007E]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {active && <span className="w-2 h-2 rounded-full bg-[#E6007E]" />}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-pink-100 flex flex-col gap-2">
              <Link
                href="/order"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center text-sm py-3 justify-center"
              >
                <Calendar className="w-4 h-4" />
                <span>Pre-Order From Calendar</span>
              </Link>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full text-center text-sm py-3 justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp (+92 370 6572463)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
