import { useEffect } from "react";
import "./MobileInputFocus.css";

export function MobileInputFocus() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const media = window.matchMedia(
      "(max-width: 1024px) and (pointer: coarse)",
    );

    let timer: ReturnType<typeof setTimeout> | undefined;
    let container: HTMLElement | null = null;
    let originalScrollTop = 0;
    let keyboardOpen = false;
    let fullHeight = viewport?.height ?? window.innerHeight;

    const getField = () => {
      const field = document.activeElement;

      if (
        !media.matches ||
        !(
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement
        ) ||
        field.readOnly ||
        field.disabled ||
        !field.closest(".auth-screen, .account-page")
      ) {
        return null;
      }

      if (
        field instanceof HTMLInputElement &&
        [
          "checkbox",
          "radio",
          "submit",
          "button",
          "reset",
          "file",
          "hidden",
          "range",
          "color",
        ].includes(field.type)
      ) {
        return null;
      }

      return field;
    };

    const clear = () => {
      if (!container) return;

      const previous = container;
      container = null;

      previous.classList.remove("mobile-input-active");
      previous.scrollTo({
        top: originalScrollTop,
        behavior: "instant",
      });
    };

    const position = () => {
      const field = getField();

      if (!field) {
        clear();
        return;
      }

      const next = field.closest<HTMLElement>(
        ".auth-screen, .screen-content",
      );

      if (!next) {
        clear();
        return;
      }

      if (container !== next) {
        clear();
        container = next;
        originalScrollTop = next.scrollTop;
      }

      container.classList.add("mobile-input-active");

      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const rect = container.getBoundingClientRect();

      const top = Math.max(rect.top, viewportTop);
      const bottom = Math.min(
        rect.bottom,
        viewportTop + viewportHeight,
      );
      const available = Math.max(0, bottom - top);
      const target = top + Math.min(80, available * 0.2);
      const delta = field.getBoundingClientRect().top - target;

      if (Math.abs(delta) > 4) {
        container.scrollBy({
          top: delta,
          behavior: "instant",
        });
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(position, 160);
    };

    const handleFocusIn = () => {
      const field = getField();

      if (field) {
        const next = field.closest<HTMLElement>(
          ".auth-screen, .screen-content",
        );

        // Capture before the delayed positioning runs.
        if (next && container !== next) {
          clear();
          container = next;
          originalScrollTop = next.scrollTop;
        }
      }

      schedule();
    };

    const handleResize = () => {
      const height = viewport?.height ?? window.innerHeight;
      const field = getField();

      if (!media.matches) {
        clearTimeout(timer);
        keyboardOpen = false;
        fullHeight = height;
        clear();
        return;
      }

      fullHeight = Math.max(fullHeight, height);

      // Detect the keyboard opening.
      if (field && fullHeight - height > 120) {
        keyboardOpen = true;
        schedule();
        return;
      }

      // Detect the keyboard closing and restore the page.
      if (keyboardOpen && fullHeight - height < 80) {
        clearTimeout(timer);
        keyboardOpen = false;
        clear();
        field?.blur();
        fullHeight = height;
        return;
      }

      if (!field) {
        clearTimeout(timer);
        clear();
        return;
      }

      schedule();
    };

    const handleOrientation = () => {
      clearTimeout(timer);
      keyboardOpen = false;
      clear();
      getField()?.blur();

      timer = setTimeout(() => {
        fullHeight = viewport?.height ?? window.innerHeight;
      }, 350);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", schedule);
    viewport?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", schedule);
      viewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(
        "orientationchange",
        handleOrientation,
      );

      clearTimeout(timer);
      clear();
    };
  }, []);

  return null;
}