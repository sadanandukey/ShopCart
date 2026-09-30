// js/cart.js

const STORAGE_KEY = 'shopkart_cart';

/* ---------- Internal helpers ---------- */
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/* ---------- Public API ---------- */
export function getCart() {
  return readCart();
}

export function addToCart(product, qty = 1) {
  const cart = readCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      qty
    });
  }
  writeCart(cart);
}

export function updateQty(id, qty) {
const targetID = Number(id);
  let cart = readCart();
  cart = cart.map((item) =>
Number(item.id) === targetId
? { ...item, qty: Math.max(1, Number(qty)) } : item
  );
  writeCart(cart);
}

export function removeFromCart(id) {
const targetID = Number(id);
  const cart = readCart().filter((item) => Number(item.id) !== targetId);
  writeCart(cart);
}

export function clearCart() {
  writeCart([]);
}

export function getCartTotal() {
  return readCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

export function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = getCartCount();
}

/* ---------- NEW: Render the cart items into the page ---------- */
export function renderCart(containerId = 'cartItems') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cart = readCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty 🛒</h2>
        <a href="products.html">Continue shopping →</a>
      </div>`;
    updateSummary();
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.img}" alt="${item.name}" width="80" />
        <div class="cart-info">
          <h3>${item.name}</h3>
          <p>₹${item.price} each</p>
        </div>

        <div class="qty-controls">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
        </div>

        <div class="item-total">₹${(item.price * item.qty).toFixed(2)}</div>

        <button class="remove-btn" data-action="remove" data-id="${item.id}">
          Remove
        </button>
      </div>`
    )
    .join('');

  updateSummary();
}

function updateSummary() {
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const total = getCartTotal();

  if (subtotalEl) subtotalEl.textContent = `₹${total.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}

/* ---------- NEW: Attach ONE listener for all buttons ---------- */
export function initCartEvents(containerId = 'cartItems') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id = Number(itemE1.dataset.id);
    const action = btn.dataset.action;
    const cart = readCart();
    const item = cart.find((i) => i.id === id);
    if (!item && action !== 'remove') return;

    switch (action) {
      case 'inc':
        updateQty(id, item.qty + 1);
        break;
      case 'dec':
        if (item.qty > 1) updateQty(id, item.qty - 1);
        break;
      case 'remove':
        removeFromCart(id);
        break;
    }

    renderCart(containerId); // re-render after change
  });
}