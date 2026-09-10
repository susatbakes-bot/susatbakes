'use client';

import React, { useState, useEffect } from 'react';
import { BakeryProduct } from '@/types/bakery';
import { BAKERY_PRODUCTS } from '@/data/products';
import { fetchWordPressMenu } from '@/lib/wordpress';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';

type MenuSectionProps = {
  preview?: boolean;
  initialProducts?: BakeryProduct[];
};

const DEFAULT_CATEGORY_TABS = [
  { slug: 'all', label: 'All Items' },
  { slug: 'brownies', label: 'Brownies' },
  { slug: 'cookies', label: 'NYC Cookies' },
  { slug: 'muffins-breads', label: 'Muffins & Breads' },
];

function normalizeSlug(category: string): string {
  const lower = (category || '').toLowerCase();
  if (/brownie/i.test(lower)) return 'brownies';
  if (/cookie/i.test(lower)) return 'cookies';
  if (/muffin|bread|loaf/i.test(lower)) return 'muffins-breads';
  return lower.replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'all';
}

export default function MenuSection({ preview = false, initialProducts }: MenuSectionProps) {
  const [products, setProducts] = useState<BakeryProduct[]>(initialProducts || BAKERY_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(!initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Read ?category=slug from URL on initial client load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      if (catParam) {
        setSelectedCategory(catParam.toLowerCase());
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const data = await fetchWordPressMenu();
        if (isMounted && data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Failed to load WordPress menu, using fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute category filter tabs matching WordPress slugs
  const knownSlugs = new Set(DEFAULT_CATEGORY_TABS.map((t) => t.slug));
  const dynamicTabs = [...DEFAULT_CATEGORY_TABS];

  products.forEach((p) => {
    const slug = p.categorySlug || normalizeSlug(p.category);
    if (slug && !knownSlugs.has(slug)) {
      knownSlugs.add(slug);
      dynamicTabs.push({ slug, label: p.category || slug });
    }
  });

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (typeof window !== 'undefined' && !preview) {
      const pathname = window.location.pathname;
      const newUrl = slug === 'all' ? pathname : `${pathname}?category=${slug}`;
      window.history.pushState(null, '', newUrl);
    }
  };

  const displayedProducts = products
    .filter((item) => {
      if (preview) return true;
      if (selectedCategory === 'all') return true;
      const itemSlug = item.categorySlug || normalizeSlug(item.category);
      return itemSlug === selectedCategory;
    })
    .slice(0, preview ? 3 : undefined);

  return (
    <div className="space-y-8">
      {!preview && (
        <div className="flex items-center justify-center">
          <div className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-full bg-white border border-pink-200 shadow-sm">
            {dynamicTabs.map((tab) => {
              const active = selectedCategory === tab.slug;
              return (
                <button
                  key={tab.slug}
                  onClick={() => handleCategorySelect(tab.slug)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#E6007E] text-white shadow-sm'
                      : 'text-[#4A2C2A] hover:text-[#E6007E] hover:bg-pink-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading && products.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#E6007E] animate-spin mx-auto" />
          <p className="text-xs text-[#7A4C4A]">Loading freshly baked menu...</p>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white rounded-3xl border border-pink-200 p-8">
          <span className="text-4xl">🍪</span>
          <h3 className="font-playfair text-lg font-bold text-[#4A2C2A]">No items found</h3>
          <p className="text-xs text-[#7A4C4A]">No items available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
