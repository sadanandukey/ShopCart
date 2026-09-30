// js/router.js
// Minimal History-API client-side router (module).
// Pattern: routes map + resolve() + click delegation + popstate listener.
// Reference pattern verified against modern SPA routing guides (History API, pushState/popstate).

const routes = [];

export function addRoute(path, handler) {
  const paramNames = [];
  const regexPath = path.replace(/:[^/]+/g, (match) => {
    paramNames.push(match.slice(1));
    return '([^/]+)';
  });
  const regex = new RegExp(`^${regexPath}$`);
  routes.push({ regex, paramNames, handler });
}

async function resolve(pathname) {
  for (const route of routes) {
    const match = pathname.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => (params[name] = match[i + 1]));
      await route.handler(params);
      return true;
    }
  }
  return false;
}

async function render() {
  const pathname = window.location.pathname || '/';
  const found = await resolve(pathname);
  if (!found) {
    document.getElementById('app').innerHTML = `
      <div class="empty-state">
        <h1>404</h1>
        <p>Page not found.</p>
        <a href="/" data-link class="btn-primary" style="display:inline-block;margin-top:1rem;">Go Home</a>
      </div>`;
  }
  updateActiveNav(pathname);
  window.scrollTo(0, 0);
}

function updateActiveNav(pathname) {
  document.querySelectorAll('.main-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === pathname || (href === '/' && pathname === '/'));
  });
}

export function navigateTo(url) {
  window.history.pushState(null, '', url);
  render();
}

export function initRouter() {
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      navigateTo(link.getAttribute('href'));
    }
  });

  window.addEventListener('popstate', render);
  window.addEventListener('DOMContentLoaded', render);
}
