import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const data = await request.formData();
  const password = data.get('password')?.toString() ?? '';
  const validPassword = import.meta.env.DASHBOARD_PASSWORD;

  if (!validPassword || password === validPassword) {
    cookies.set('dashboard_token', validPassword ?? 'dev', {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return redirect('/');
  }

  return redirect('/login?error=1');
};
