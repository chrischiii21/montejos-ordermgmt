import { q as createRenderInstruction, h as addAttribute, v as renderHead, p as renderSlot, k as renderTemplate } from './entrypoint_CjIi3Vz0.mjs';
import { c as createComponent } from './astro-component_BH4_hqhH.mjs';
import 'piccolore';
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/jpeg" href="/logo.jpg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Montejo's Lechon & Food Trays - Argao</title><!-- Google Fonts for premium typography --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "C:/Users/L E N O V O/Downloads/new-order-mgmt/src/layouts/Layout.astro", void 0);

export { $$Layout as $, renderScript as r };
