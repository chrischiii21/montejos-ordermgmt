import { d as defineMiddleware, s as sequence } from './chunks/sequence_BJqB9x0t.mjs';
import 'piccolore';
import 'clsx';

const PROTECTED_ROUTES = ["/"];
const onRequest$1 = defineMiddleware(({ request, cookies, redirect }, next) => {
  const url = new URL(request.url);
  if (PROTECTED_ROUTES.includes(url.pathname)) {
    cookies.get("dashboard_token")?.value;
    {
      return next();
    }
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
