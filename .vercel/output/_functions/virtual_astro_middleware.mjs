import { d as defineMiddleware, s as sequence } from './chunks/sequence_BJqB9x0t.mjs';
import 'piccolore';
import 'clsx';

const PROTECTED_PREFIXES = ["/"];
const EXEMPT_PREFIXES = ["/_astro", "/assets", "/favicon", "/api", "/.netlify/functions"];
const onRequest$1 = defineMiddleware(({ request, cookies, redirect }, next) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (request.method === "OPTIONS") return next();
  for (const p of EXEMPT_PREFIXES) {
    if (pathname === p || pathname.startsWith(p + "/")) return next();
  }
  if (!PROTECTED_PREFIXES || PROTECTED_PREFIXES.length === 0) return next();
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
  if (!isProtected) return next();
  const token = cookies.get("dashboard_token")?.value;
  const validToken = "montejo2026";
  if (!token || token !== validToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + url.search);
    return redirect(loginUrl.toString());
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
