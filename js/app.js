// js/app.js
// Entry point: wires routes to views and boots the router + cart badge.

import { addRoute, initRouter } from './router.js';
import { renderHome, renderProducts, renderProductDetail, renderCart, renderAbout } from './views.js';
import { updateCartBadge } from './cart.js';

addRoute('/', renderHome);
addRoute('/products', renderProducts);
addRoute('/product/:id', renderProductDetail);
addRoute('/cart', renderCart);
addRoute('/about', renderAbout);

initRouter();
updateCartBadge();
