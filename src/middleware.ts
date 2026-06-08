import { defineMiddleware } from 'astro:middleware';

// Routes that require the dashboard session cookie
const PROTECTED_ROUTES = ['/'];

export const onRequest = defineMiddleware(({ request, cookies, redirect }, next) => {
  const url = new URL(request.url);

  if (PROTECTED_ROUTES.includes(url.pathname)) {
    const token = cookies.get('dashboard_token')?.value;
    const validToken = import.meta.env.DASHBOARD_PASSWORD;

    if (!validToken) {
      // No password configured — allow access (dev fallback)
      return next();
    }

    if (!token || token !== validToken) {
      return redirect('/login');
    }
  }

  return next();
});
