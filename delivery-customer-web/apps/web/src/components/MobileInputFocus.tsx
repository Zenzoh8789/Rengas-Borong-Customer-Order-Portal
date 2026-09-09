import { useEffect } from "react";
import "./MobileInputFocus.css";

export function MobileInputFocus() {
  useEffect(() => {
    const viewport = window.visualViewport;
    let timer: ReturnType<typeof setTimeout>;
    let container: HTMLElement | null = null;
    const clear = () => { container?.classList.remove("mobile-input-active"); container = null; };
    const position = () => {
      const field = document.activeElement;
      if (!window.matchMedia("(max-width: 768px) and (pointer: coarse)").matches ||
          !(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) ||
          field.readOnly || field.disabled ||
          !field.closest(".auth-screen, .account-page") ||
          (field instanceof HTMLInputElement && ["checkbox", "radio", "submit", "button", "file", "hidden", "range", "color"].includes(field.type))) { clear(); return; }
      const next = field.closest<HTMLElement>(".auth-screen, .screen-content");
      if (!next) return;
      if (container !== next) { clear(); container = next; }
      container.classList.add("mobile-input-active");
      const top = Math.max(container.getBoundingClientRect().top, viewport?.offsetTop || 0);
      const available = Math.min(container.clientHeight, viewport?.height || window.innerHeight);
      const target = top + Math.min(80, available * 0.2);
      const delta = field.getBoundingClientRect().top - target;
      if (Math.abs(delta) > 4) container.scrollBy({ top: delta, behavior: "instant" });
    };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(position, 160); };
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    viewport?.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    return () => {
      clearTimeout(timer); clear();
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", schedule);
      viewport?.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);
  return null;
}
