import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ cookies, redirect }) => {
  cookies.delete('dashboard_token', { path: '/' });
  return redirect('/login');
};
