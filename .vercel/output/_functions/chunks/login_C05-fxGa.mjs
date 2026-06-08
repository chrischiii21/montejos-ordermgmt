const POST = async ({ request, cookies, redirect }) => {
  const data = await request.formData();
  data.get("password")?.toString() ?? "";
  {
    cookies.set("dashboard_token", "dev", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
      // 7 days
    });
    return redirect("/");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
