const POST = async ({ request, cookies, redirect }) => {
  const data = await request.formData();
  const password = data.get("password")?.toString() ?? "";
  const validPassword = "montejo2026";
  if (password === validPassword) {
    cookies.set("dashboard_token", validPassword, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
      // 7 days
    });
    return redirect("/");
  }
  return redirect("/login?error=1");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
