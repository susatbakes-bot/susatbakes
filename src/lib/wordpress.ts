import { BakeryProduct } from '@/types/bakery';
import { BAKERY_PRODUCTS } from '@/data/products';

/**
 * Safely strips HTML tags and decodes common HTML entities from WordPress content
 */
export function stripHtml(raw: string = ''): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .trim();
}

/**
 * Extracts a featured image URL from various WordPress REST API formats
 */
export function extractWordPressImage(post: any): string | undefined {
  if (!post) return undefined;

  // 1. Embedded featured media (standard wp/v2/posts?_embed=1)
  const embeddedMedia = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (embeddedMedia) return embeddedMedia;

  // 2. Direct featured_media_src_url plugin
  if (post.featured_media_src_url) return post.featured_media_src_url;

  // 3. Better featured image plugin
  if (post.better_featured_image?.source_url) return post.better_featured_image.source_url;

  // 4. WooCommerce images array
  if (Array.isArray(post.images) && post.images.length > 0 && post.images[0].src) {
    return post.images[0].src;
  }

  // 5. ACF image field (can be URL string or object)
  if (post.acf?.image) {
    if (typeof post.acf.image === 'string') return post.acf.image;
    if (typeof post.acf.image === 'object' && post.acf.image.url) return post.acf.image.url;
  }

  return undefined;
}

/**
 * Extracts price number from WordPress post fields or content
 */
export function extractWordPressPrice(post: any): number {
  if (!post) return 0;

  // 1. ACF custom field
  if (post.acf?.price !== undefined && post.acf.price !== null) {
    const p = Number(post.acf.price);
    if (!isNaN(p) && p > 0) return p;
  }

  // 2. WooCommerce / custom direct fields
  const directPrice = post.price ?? post.regular_price;
  if (directPrice !== undefined && directPrice !== null) {
    const p = Number(directPrice);
    if (!isNaN(p) && p > 0) return p;
  }

  // 3. Post meta
  if (post.meta?.price) {
    const p = Number(post.meta.price);
    if (!isNaN(p) && p > 0) return p;
  }

  // 4. Regex search in content/excerpt for "Rs. 1,299" or "Rs 1299"
  const text = (post.content?.rendered || '') + ' ' + (post.excerpt?.rendered || '');
  const match = text.match(/(?:Rs\.?|PKR)\s*([\d,]+)/i);
  if (match && match[1]) {
    const parsed = parseInt(match[1].replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return 0;
}

/**
 * Derives category and category slug from WordPress taxonomy terms or title keywords
 */
export function extractWordPressCategory(post: any, title: string): string {
  return extractWordPressCategoryInfo(post, title).name;
}

export function extractWordPressCategoryInfo(post: any, title: string): { name: string; slug: 'brownies' | 'cookies' | 'muffins-breads' | string } {
  // 1. ACF custom category
  if (post.acf?.category) {
    const cat = String(post.acf.category);
    const lower = cat.toLowerCase();
    if (/brownie/i.test(lower)) return { name: 'Brownies', slug: 'brownies' };
    if (/cookie/i.test(lower)) return { name: 'Cookies', slug: 'cookies' };
    if (/muffin|bread/i.test(lower)) return { name: 'Muffins & Breads', slug: 'muffins-breads' };
    return { name: cat, slug: lower.replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') };
  }

  // 2. Embedded taxonomy terms (_embedded['wp:term'][0])
  const terms = post._embedded?.['wp:term']?.[0];
  if (Array.isArray(terms) && terms.length > 0) {
    const term = terms[0];
    const slug = String(term.slug || '').toLowerCase();
    const termName = String(term.name || '').trim();
    if (/brownie/i.test(slug) || /brownie/i.test(termName)) {
      return { name: 'Brownies', slug: 'brownies' };
    }
    if (/cookie/i.test(slug) || /cookie/i.test(termName)) {
      return { name: 'Cookies', slug: 'cookies' };
    }
    if (/muffin|bread/i.test(slug) || /muffin|bread/i.test(termName)) {
      return { name: 'Muffins & Breads', slug: 'muffins-breads' };
    }
    if (slug) {
      return { name: termName || slug, slug };
    }
  }

  // 3. Match from title
  const lower = title.toLowerCase();
  if (lower.includes('brownie')) return { name: 'Brownies', slug: 'brownies' };
  if (lower.includes('cookie')) return { name: 'Cookies', slug: 'cookies' };
  if (lower.includes('muffin') || lower.includes('bread') || lower.includes('loaf')) {
    return { name: 'Muffins & Breads', slug: 'muffins-breads' };
  }

  return { name: 'Cookies', slug: 'cookies' };
}

/**
 * Computes box options and dynamic pricing offsets for bakery products.
 * Rules:
 * - Brownies: Box of 4 (Base: 1,349), Box of 6 (+500: 1,849), Box of 9 (+650: 1,999)
 * - NYC Chocolate Chip Cookies: Box of 4 (Base: 1,349), Box of 6 (+631: 1,980)
 * - Red Velvet & Nutella Cookies: Box of 4 (Base: 1,599), Box of 6 (+550: 2,149)
 * - Lotus Biscoff Cookies: Box of 4 (Base: 1,880), Box of 6 (+469: 2,349)
 * - Muffins & Breads: Keep as fixed single-option items.
 */
export function computeProductPricing(product: {
  name: string;
  category?: string;
  categorySlug?: string;
  basePrice?: number;
  fixedPrice?: number;
  fixedVariant?: string;
  boxOptions?: any[];
}): {
  categorySlug: 'brownies' | 'cookies' | 'muffins-breads' | string;
  categoryName: string;
  isSingleOption: boolean;
  basePrice: number;
  boxOptions?: { label: string; size: number; price: number }[];
  fixedPrice?: number;
  fixedVariant?: string;
} {
  const nameLower = product.name.toLowerCase();
  const catLower = (product.categorySlug || product.category || '').toLowerCase();

  // 1. Muffins & Breads (Fixed single-option items)
  if (
    catLower.includes('muffin') ||
    catLower.includes('bread') ||
    nameLower.includes('muffin') ||
    nameLower.includes('bread') ||
    nameLower.includes('loaf')
  ) {
    const isBread = nameLower.includes('bread') || nameLower.includes('loaf');
    const defaultPrice = isBread ? 1549 : nameLower.includes('banana') ? 1449 : 1549;
    const fixedPrice = (product.fixedPrice && product.fixedPrice > 0) ? product.fixedPrice : (product.basePrice && product.basePrice > 0 ? product.basePrice : defaultPrice);
    const fixedVariant = product.fixedVariant || (isBread ? '1.5 lb Loaf' : 'Box of 9');

    return {
      categorySlug: 'muffins-breads',
      categoryName: 'Muffins & Breads',
      isSingleOption: true,
      basePrice: fixedPrice,
      fixedPrice,
      fixedVariant,
    };
  }

  // 2. Brownies (Box of 4, Box of 6, Box of 9)
  if (catLower.includes('brownie') || nameLower.includes('brownie')) {
    const basePrice = (product.basePrice && product.basePrice > 0) ? product.basePrice : 1349;
    return {
      categorySlug: 'brownies',
      categoryName: 'Brownies',
      isSingleOption: false,
      basePrice,
      boxOptions: [
        { label: 'Box of 4', size: 4, price: basePrice },
        { label: 'Box of 6', size: 6, price: basePrice + 500 },
        { label: 'Box of 9', size: 9, price: basePrice + 650 },
      ],
    };
  }

  // 3. NYC Chocolate Chip Cookies
  if (nameLower.includes('chocolate chip') || nameLower.includes('choc chip')) {
    const basePrice = (product.basePrice && product.basePrice > 0) ? product.basePrice : 1349;
    return {
      categorySlug: 'cookies',
      categoryName: 'Cookies',
      isSingleOption: false,
      basePrice,
      boxOptions: [
        { label: 'Box of 4', size: 4, price: basePrice },
        { label: 'Box of 6', size: 6, price: basePrice + 631 },
      ],
    };
  }

  // 4. Red Velvet & Nutella Cookies
  if (nameLower.includes('red velvet') || (nameLower.includes('nutella') && !nameLower.includes('muffin'))) {
    const basePrice = (product.basePrice && product.basePrice > 0) ? product.basePrice : 1599;
    return {
      categorySlug: 'cookies',
      categoryName: 'Cookies',
      isSingleOption: false,
      basePrice,
      boxOptions: [
        { label: 'Box of 4', size: 4, price: basePrice },
        { label: 'Box of 6', size: 6, price: basePrice + 550 },
      ],
    };
  }

  // 5. Lotus Biscoff Cookies
  if (nameLower.includes('lotus') || nameLower.includes('biscoff')) {
    const basePrice = (product.basePrice && product.basePrice > 0) ? product.basePrice : 1880;
    return {
      categorySlug: 'cookies',
      categoryName: 'Cookies',
      isSingleOption: false,
      basePrice,
      boxOptions: [
        { label: 'Box of 4', size: 4, price: basePrice },
        { label: 'Box of 6', size: 6, price: basePrice + 469 },
      ],
    };
  }

  // 6. Generic/Other Cookies
  if (catLower.includes('cookie') || nameLower.includes('cookie')) {
    const basePrice = (product.basePrice && product.basePrice > 0) ? product.basePrice : 1349;
    return {
      categorySlug: 'cookies',
      categoryName: 'Cookies',
      isSingleOption: false,
      basePrice,
      boxOptions: [
        { label: 'Box of 4', size: 4, price: basePrice },
        { label: 'Box of 6', size: 6, price: basePrice + 550 },
      ],
    };
  }

  // If explicit boxOptions already provided from ACF
  if (Array.isArray(product.boxOptions) && product.boxOptions.length > 0) {
    return {
      categorySlug: catLower || 'cookies',
      categoryName: product.category || 'Cookies',
      isSingleOption: false,
      basePrice: product.boxOptions[0].price,
      boxOptions: product.boxOptions,
    };
  }

  const fixedPrice = product.fixedPrice || product.basePrice || 1349;
  return {
    categorySlug: catLower || 'cookies',
    categoryName: product.category || 'Cookies',
    isSingleOption: true,
    basePrice: fixedPrice,
    fixedPrice,
    fixedVariant: product.fixedVariant || 'Standard',
  };
}

/**
 * Selects an appropriate emoji based on category and title
 */
export function getProductEmoji(category: string, title: string): string {
  const t = title.toLowerCase();
  if (t.includes('brownie')) return '🍫';
  if (t.includes('cookie')) return '🍪';
  if (t.includes('bread') || t.includes('loaf')) return '🍞';
  if (t.includes('muffin') || t.includes('cupcake')) return '🧁';

  if (category === 'Brownies') return '🍫';
  if (category === 'Cookies') return '🍪';
  if (category === 'Muffins & Breads') return '🧁';
  return '🍪';
}

/**
 * Maps a raw WordPress REST API post/product payload to a BakeryProduct
 */
export function mapWordPressToProduct(post: any): BakeryProduct {
  const rawTitle = post.title?.rendered || post.name || post.title || 'Artisanal Treat';
  const name = stripHtml(rawTitle);
  const rawDesc = post.excerpt?.rendered || post.content?.rendered || post.description || '';
  const description = stripHtml(rawDesc) || `Freshly baked ${name} prepared with premium artisanal ingredients.`;
  const { name: categoryName, slug: categorySlug } = extractWordPressCategoryInfo(post, name);
  const imageUrl = extractWordPressImage(post);
  const rawPrice = extractWordPressPrice(post);
  const emoji = post.acf?.emoji || getProductEmoji(categoryName, name);
  const tag = post.acf?.tag || (post.sticky ? 'Featured' : undefined);

  // Compute box options and dynamic price calculation offsets
  const pricing = computeProductPricing({
    name,
    category: categoryName,
    categorySlug,
    basePrice: rawPrice,
    fixedPrice: rawPrice,
  });

  const product: BakeryProduct = {
    id: String(post.id || post.slug || Math.random().toString(36).slice(2, 8)),
    name,
    category: pricing.categoryName,
    categorySlug: pricing.categorySlug,
    emoji,
    description,
    tag,
    imageUrl,
    basePrice: pricing.basePrice,
    boxOptions: pricing.boxOptions,
    fixedPrice: pricing.fixedPrice,
    fixedVariant: pricing.fixedVariant,
  };

  // If WordPress ACF explicitly provides custom flavor choices
  if (Array.isArray(post.acf?.flavors) && post.acf.flavors.length > 0) {
    product.flavors = post.acf.flavors.map((f: any) => ({
      name: f.name || String(f),
      price: Number(f.price) || pricing.basePrice,
      description: f.description ? stripHtml(f.description) : undefined,
    }));
  }

  return product;
}

/**
 * Fetches menu posts/products from the WordPress REST API endpoint.
 * Appends ?per_page=100&_embed=true to fetch all 11 published catalog items.
 * Falls back to default BAKERY_PRODUCTS if the endpoint is not set, fails, or is offline.
 */
export async function fetchWordPressMenu(): Promise<BakeryProduct[]> {
  const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

  // 1. If no WordPress URL configured or placeholder, safely return default menu
  if (!apiUrl || apiUrl.includes('your-wordpress-site.com') || apiUrl.trim() === '') {
    return BAKERY_PRODUCTS;
  }

  try {
    // Append per_page=100&_embed=true to load all published catalog items
    const url = new URL(apiUrl);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('_embed', 'true');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[WordPress API] HTTP error ${res.status} from ${apiUrl}. Falling back to default products.`);
      return BAKERY_PRODUCTS;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[WordPress API] Returned empty or non-array payload. Falling back to default products.');
      return BAKERY_PRODUCTS;
    }

    console.log(`[WordPress API] Successfully retrieved ${data.length} posts from ${url.toString()}`);
    const mapped = data.map(mapWordPressToProduct);
    return mapped;
  } catch (err) {
    const e = err as any;
    console.warn(`[WordPress API] Could not fetch from ${apiUrl} (${e.message || e}). Using fallback menu.`);
    return BAKERY_PRODUCTS;
  }
}

export default fetchWordPressMenu;
