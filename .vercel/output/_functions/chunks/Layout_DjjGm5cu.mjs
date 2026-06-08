import { J as createRenderInstruction, I as renderTemplate, bi as renderSlot, bj as renderHead, _ as addAttribute } from './sequence_BJqB9x0t.mjs';
import { c as createComponent } from './astro-component_DA2eirrS.mjs';
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

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/jpeg" href="/logo.jpg"><meta name="generator"', `><title>Montejo's Lechon & Food Trays - Argao</title><!-- Google Fonts for premium typography --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><script>
			(function() {
				const savedTheme = localStorage.getItem('theme') || 'dark';
				document.documentElement.setAttribute('data-theme', savedTheme);
			})();
		<\/script>`, "</head> <body> ", "</body></html>"])), addAttribute(Astro2.generator, "content"), renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/L E N O V O/Downloads/new-order-mgmt/src/layouts/Layout.astro", void 0);

export { $$Layout as $, renderScript as r };
