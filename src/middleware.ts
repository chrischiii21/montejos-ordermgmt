import { defineMiddleware } from 'astro:middleware';

// Prefixes that require the dashboard session cookie. Use prefixes to protect
// whole sections (e.g. '/' protects everything under root). Adjust as needed.
const PROTECTED_PREFIXES = ['/'];

// Paths (or prefixes) that should always be allowed (assets, API, public files)
const EXEMPT_PREFIXES = ['/_astro', '/assets', '/favicon', '/api', '/.netlify/functions'];

export const onRequest = defineMiddleware(({ request, cookies, redirect }, next) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Allow CORS preflight and similar
  if (request.method === 'OPTIONS') return next();

  // Exempt static and public asset paths
  for (const p of EXEMPT_PREFIXES) {
    if (pathname === p || pathname.startsWith(p + '/')) return next();
  }

  // If no protected prefixes are configured, allow access (safe default)
  if (!PROTECTED_PREFIXES || PROTECTED_PREFIXES.length === 0) return next();

  // If the request path matches any protected prefix, enforce cookie check
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/') );
  if (!isProtected) return next();

  const token = cookies.get('dashboard_token')?.value;
  const validToken = import.meta.env.DASHBOARD_PASSWORD;

  // If no dashboard password is configured, allow access (dev fallback)
  if (!validToken) return next();

  // If token missing or invalid, redirect to login and preserve original path
  if (!token || token !== validToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname + url.search);
    return redirect(loginUrl.toString());
  }

  return next();
});
