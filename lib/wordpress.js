// lib/wordpress.js - Pure JavaScript helper utility for WordPress REST API

function stripHtml(raw = '') {
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

function extractWordPressImage(post) {
  if (!post) return undefined;
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  if (post.featured_media_src_url) return post.featured_media_src_url;
  if (post.better_featured_image && post.better_featured_image.source_url) {
    return post.better_featured_image.source_url;
  }
  if (Array.isArray(post.images) && post.images.length > 0 && post.images[0].src) {
    return post.images[0].src;
  }
  if (post.acf && post.acf.image) {
    if (typeof post.acf.image === 'string') return post.acf.image;
    if (typeof post.acf.image === 'object' && post.acf.image.url) return post.acf.image.url;
  }
  return undefined;
}

function extractWordPressPrice(post) {
  if (!post) return 1299;
  if (post.acf && post.acf.price !== undefined && post.acf.price !== null) {
    const p = Number(post.acf.price);
    if (!isNaN(p) && p > 0) return p;
  }
  const directPrice = post.price !== undefined ? post.price : post.regular_price;
  if (directPrice !== undefined && directPrice !== null) {
    const p = Number(directPrice);
    if (!isNaN(p) && p > 0) return p;
  }
  if (post.meta && post.meta.price) {
    const p = Number(post.meta.price);
    if (!isNaN(p) && p > 0) return p;
  }
  const text = (post.content && post.content.rendered ? post.content.rendered : '') + ' ' + (post.excerpt && post.excerpt.rendered ? post.excerpt.rendered : '');
  const match = text.match(/(?:Rs\.?|PKR)\s*([\d,]+)/i);
  if (match && match[1]) {
    const parsed = parseInt(match[1].replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function extractWordPressCategory(post, title) {
  if (post.acf && post.acf.category) return String(post.acf.category);
  if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]) {
    const term = post._embedded['wp:term'][0][0];
    if (term && term.name) {
      const termName = term.name.trim();
      if (/brownie/i.test(termName)) return 'Brownies';
      if (/cookie/i.test(termName)) return 'Cookies';
      if (/muffin|bread/i.test(termName)) return 'Muffins & Breads';
      return termName;
    }
  }
  const lower = title.toLowerCase();
  if (lower.includes('brownie')) return 'Brownies';
  if (lower.includes('cookie')) return 'Cookies';
  if (lower.includes('muffin') || lower.includes('bread') || lower.includes('loaf')) {
    return 'Muffins & Breads';
  }
  return 'Cookies';
}

function extractWordPressCategoryInfo(post, title) {
  if (post && post.acf && post.acf.category) {
    const cat = String(post.acf.category);
    const lower = cat.toLowerCase();
    if (/brownie/i.test(lower)) return { name: 'Brownies', slug: 'brownies' };
    if (/cookie/i.test(lower)) return { name: 'Cookies', slug: 'cookies' };
    if (/muffin|bread/i.test(lower)) return { name: 'Muffins & Breads', slug: 'muffins-breads' };
    return { name: cat, slug: lower.replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') };
  }

  const terms = post && post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0];
  if (Array.isArray(terms) && terms.length > 0) {
    const term = terms[0];
    const slug = String(term.slug || '').toLowerCase();
    const termName = String(term.name || '').trim();
    if (/brownie/i.test(slug) || /brownie/i.test(termName)) return { name: 'Brownies', slug: 'brownies' };
    if (/cookie/i.test(slug) || /cookie/i.test(termName)) return { name: 'Cookies', slug: 'cookies' };
    if (/muffin|bread/i.test(slug) || /muffin|bread/i.test(termName)) return { name: 'Muffins & Breads', slug: 'muffins-breads' };
    if (slug) return { name: termName || slug, slug };
  }

  const lower = (title || '').toLowerCase();
  if (lower.includes('brownie')) return { name: 'Brownies', slug: 'brownies' };
  if (lower.includes('cookie')) return { name: 'Cookies', slug: 'cookies' };
  if (lower.includes('muffin') || lower.includes('bread') || lower.includes('loaf')) {
    return { name: 'Muffins & Breads', slug: 'muffins-breads' };
  }

  return { name: 'Cookies', slug: 'cookies' };
}

function getProductEmoji(category, title) {
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

function mapWordPressToProduct(post) {
  const rawTitle = (post.title && post.title.rendered) || post.name || post.title || 'Artisanal Treat';
  const name = stripHtml(rawTitle);
  const rawDesc = (post.excerpt && post.excerpt.rendered) || (post.content && post.content.rendered) || post.description || '';
  const description = stripHtml(rawDesc) || ('Freshly baked ' + name + ' prepared with premium artisanal ingredients.');
  const categoryInfo = extractWordPressCategoryInfo(post, name);
  const imageUrl = extractWordPressImage(post);
  const rawPrice = extractWordPressPrice(post);
  const emoji = (post.acf && post.acf.emoji) || getProductEmoji(categoryInfo.name, name);
  const tag = (post.acf && post.acf.tag) || (post.sticky ? 'Featured' : undefined);

  const pricing = computeProductPricing({
    name,
    category: categoryInfo.name,
    categorySlug: categoryInfo.slug,
    basePrice: rawPrice,
    fixedPrice: rawPrice,
  });

  const product = {
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

  if (post.acf && Array.isArray(post.acf.flavors) && post.acf.flavors.length > 0) {
    product.flavors = post.acf.flavors.map((f) => ({
      name: f.name || String(f),
      price: Number(f.price) || pricing.basePrice,
      description: f.description ? stripHtml(f.description) : undefined,
    }));
  }

  return product;
}

function computeProductPricing(product) {
  const nameLower = (product.name || '').toLowerCase();
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

async function fetchWordPressMenu() {
  const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!apiUrl || apiUrl.includes('your-wordpress-site.com') || apiUrl.trim() === '') {
    return [];
  }

  try {
    const url = new URL(apiUrl);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('_embed', 'true');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('[WordPress API] HTTP error ' + res.status + ' from ' + apiUrl);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map(mapWordPressToProduct);
  } catch (err) {
    console.warn('[WordPress API] Fetch failed:', err.message || err);
    return [];
  }
}

module.exports = {
  stripHtml,
  extractWordPressImage,
  extractWordPressPrice,
  extractWordPressCategory,
  getProductEmoji,
  mapWordPressToProduct,
  fetchWordPressMenu,
};
