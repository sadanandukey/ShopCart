// js/productService.js
// Data-access module: fetches and caches the product catalog (JSON asset).
// Decouples data-fetching from rendering logic (separation of concerns).

let cache = null;

export async function getProducts() {
  if (cache) return cache;
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error(`Failed to load products (${response.status})`);
    cache = await response.json();
    return cache;
  } catch (error) {
    console.error('Product fetch error:', error);
    return [];
  }
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find((p) => String(p.id) === String(id));
}

export async function searchProducts({ query = '', category = 'All', sort = 'default' } = {}) {
  let products = await getProducts();

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    products = products.filter((p) => p.category === category);
  }

  const sorted = [...products];
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);

  return sorted;
}

export async function getCategories() {
  const products = await getProducts();
  return ['All', ...new Set(products.map((p) => p.category))];
}
