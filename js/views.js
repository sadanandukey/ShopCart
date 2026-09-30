// js/views.js
// View/render functions — one function per "page". Kept separate from routing
// and data logic so each concern (routes / data / cart / views) is modular.

import { getProducts, getProductById, searchProducts, getCategories } from './productService.js';
import { addToCart, getCart, updateQty, removeFromCart, getCartTotal, clearCart } from './cart.js';
import { navigateTo } from './router.js';

const app = document.getElementById('app');

function formatPrice(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function productCardHTML(p) {
  return `
    <div class="product-card">
      <div class="product-thumb">${p.img}</div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <span class="product-rating">⭐ ${p.rating}</span>
        <span class="product-price">${formatPrice(p.price)}</span>
        <div class="product-actions">
          <a href="/product/${p.id}" data-link class="btn-outline">Details</a>
          <button class="btn-primary add-cart-btn" data-id="${p.id}">Add</button>
        </div>
      </div>
    </div>`;
}

function attachAddToCartHandlers(container) {
  container.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const product = await getProductById(btn.dataset.id);
      if (product) {
        addToCart(product);
        btn.textContent = 'Added ✓';
        setTimeout(() => (btn.textContent = 'Add'), 900);
      }
    });
  });
}

// ---------- HOME VIEW ----------
export async function renderHome() {
  app.innerHTML = `
    <section class="hero-banner">
      <h1>Everything you need, all in one cart</h1>
      <p>Curated tech and lifestyle products at honest prices. Built as a full-stack capstone demo.</p>
      <a href="/products" data-link class="btn">Shop Now</a>
    </section>
    <h2 class="section-title">Featured Products</h2>
    <div class="product-grid" id="featuredGrid">
      ${Array(4).fill('<div class="skeleton"></div>').join('')}
    </div>
  `;
  const products = await getProducts();
  const featured = products.slice(0, 4);
  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = featured.map(productCardHTML).join('');
  attachAddToCartHandlers(grid);
}

// ---------- PRODUCTS LISTING VIEW ----------
export async function renderProducts() {
  const categories = await getCategories();

  app.innerHTML = `
    <h2 class="section-title">All Products</h2>
    <div class="toolbar">
      <input type="text" id="searchInput" placeholder="Search products..." />
      <select id="categorySelect">
        ${categories.map((c) => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <select id="sortSelect">
        <option value="default">Sort: Default</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
    <div class="product-grid" id="productGrid">
      ${Array(8).fill('<div class="skeleton"></div>').join('')}
    </div>
  `;

  const grid = document.getElementById('productGrid');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');
  const sortSelect = document.getElementById('sortSelect');

  async function refresh() {
    const results = await searchProducts({
      query: searchInput.value,
      category: categorySelect.value,
      sort: sortSelect.value,
    });
    grid.innerHTML = results.length
      ? results.map(productCardHTML).join('')
      : `<p class="empty-state">No products match your search.</p>`;
    attachAddToCartHandlers(grid);
  }

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(refresh, 250);
  });
  categorySelect.addEventListener('change', refresh);
  sortSelect.addEventListener('change', refresh);

  await refresh();
}

// ---------- PRODUCT DETAIL VIEW ----------
export async function renderProductDetail({ id }) {
  app.innerHTML = `<div class="skeleton" style="height:300px;"></div>`;
  const product = await getProductById(id);

  if (!product) {
    app.innerHTML = `<p class="empty-state">Product not found.</p>`;
    return;
  }

  app.innerHTML = `
    <a href="/products" data-link class="back-link">← Back to products</a>
    <div class="detail-grid">
<div class="cart-list" id="carrtList">
      <div class="detail-thumb">${product.img}</div>
      <div class="detail-info">
        <span class="product-cat">${product.category}</span>
        <h1>${product.name}</h1>
        <span class="product-rating">⭐ ${product.rating} rating</span>
        <p class="product-price">${formatPrice(product.price)}</p>
        <p class="desc">${product.desc}</p>
        <button class="btn-primary add-cart-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `;
  attachAddToCartHandlers(app);
}

// ---------- CART VIEW ----------
export function renderCart() {
  const cart = getCart();

  if (cart.length === 0) {
    app.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty</h2>
        <a href="/products" data-link class="btn-primary" style="display:inline-block;margin-top:1rem;">Browse Products</a>
      </div>`;
    return;
  }

  app.innerHTML = `
    <h2 class="section-title">Your Cart</h2>
    <div class="cart-list" id="cartList">
      ${cart
        .map(
          (item) => `
        <div class="cart-item" data-id="${item.id}">
          <span class="thumb">${item.img}</span>
          <div class="info">
            <strong>${item.name}</strong>   
            <p>${formatPrice(item.price)} each</p>
          </div>
          <div class="qty-controls">
<!--            <button class="qty-btn" data-action="dec">−</button>  -->  
            <span><p>Qty</p>${item.qty}</span>
<!--            <button class="qty-btn" data-action="inc">+</button>  --> 
          </div>
          <span>${formatPrice(item.price * item.qty)}</span>
<!--          <button class="remove-btn">Remove</button>               -->
        </div>`
        )
        .join('')}
    </div>
    <div class="cart-summary">
      <span>Total</span>
      <span>${formatPrice(getCartTotal())}</span>
    </div>
    <button class="btn-primary" id="clearCartBtn" style="margin-top:1rem;">Clear Cart</button>
  `;

  document.getElementById('cartList').addEventListener('click', (e) => {
    const itemEl = e.target.closest('.cart-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    const cart = getCart();
    const current = cart.find((c) => String(c.id) === String(id));

    if (e.target.classList.contains('remove-btn')) {
      removeFromCart(id);
      renderCart();
    } else if (e.target.dataset.action === 'inc') {
      updateQty(id, current.qty + 1);
      renderCart();
    } else if (e.target.dataset.action === 'dec') {
      updateQty(id, current.qty - 1);
      renderCart();
    }
  });

  document.getElementById('clearCartBtn').addEventListener('click', () => {
    clearCart();
    renderCart();
  });
}

// ---------- ABOUT VIEW ----------
export function renderAbout() {
  app.innerHTML = `
    <div class="about-content">
      <h1>About ShopCart</h1>
      <p>ShopCart is a full-stack capstone project demonstrating modular frontend architecture, client-side routing with the History API and optimized asset delivery — built entirely with vanilla HTML, CSS and JavaScript ES modules.</p>
      <p>The app uses a component-style structure: a router module handles navigation without full page reloads, a product service module fetches and filters catalog data, and a cart module manages persisted state via localStorage.</p><h2>Thank You <h3>for coming</h3></h2>
      <p>Built by Sadanand Nandkishor Ukey, As a demonstration of production-grade frontend engineering practice.</p>
<h5 class="left-text">
<a href="https://www.instagram.com/ukeysadanand" arial-label="Instagram">Instagram</a>
<a href="https://www.twitter.com/SadanandUkey" arial-label="Twitter">Twitter</a>
<a href="https://www.github.com/SadanandUkey" arial-label="GitHub">GitHub</a>
</h5>
    </div>
  `;
}
