import { s as store_get, e as ensure_array_like, a as attr_class, b as attr, c as stringify, d as spread_props, u as unsubscribe_stores, f as slot } from "../../chunks/index2.js";
import { m as modalStore } from "../../chunks/modalStore.js";
function ModalContainer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const _stack = modalStore;
    modalStore.current;
    modalStore.lastOpener;
    if (store_get($$store_subs ??= {}, "$_stack", _stack).length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button type="button" class="modal-backdrop svelte-6t6cxg" aria-hidden="true"></button> <div class="modal-root svelte-6t6cxg" tabindex="-1" role="dialog" aria-modal="true"><!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$_stack", _stack));
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let item = each_array[idx];
        $$renderer2.push(`<div${attr_class(`modal-pane ${stringify(idx === store_get($$store_subs ??= {}, "$_stack", _stack).length - 1 ? "top" : "hidden")}`, "svelte-6t6cxg")}${attr("aria-hidden", idx === store_get($$store_subs ??= {}, "$_stack", _stack).length - 1 ? "false" : "true")}>`);
        if (item.component) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<!---->`);
          item.component($$renderer2, spread_props([item.props || {}]));
          $$renderer2.push(`<!---->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.push(`<!--[-->`);
  slot($$renderer, $$props, "default", {});
  $$renderer.push(`<!--]-->  `);
  ModalContainer($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _layout as default
};
