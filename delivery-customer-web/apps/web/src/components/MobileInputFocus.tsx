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

      if (!field || !keyboardOpen) {
        clear();
        return;
      }

      // Find the nearest container configured for vertical scrolling.
      let next: HTMLElement | null = field.parentElement;

      while (next) {
        const { overflowY } = window.getComputedStyle(next);

        if (/^(auto|scroll|overlay)$/.test(overflowY)) {
          break;
        }

        next = next.parentElement;
      }

      if (!next) {
        next = document.scrollingElement as HTMLElement | null;
      }

      if (!next) return;

      if (container !== next) {
        clear();
        container = next;
        originalScrollTop = next.scrollTop;
      }

      container.classList.add("mobile-input-active");

      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom =
        viewportTop + (viewport?.height ?? window.innerHeight);

      const isDocument = container === document.scrollingElement;
      const containerRect = container.getBoundingClientRect();

      const visibleTop = isDocument
        ? viewportTop
        : Math.max(viewportTop, containerRect.top + container.clientTop);

      const visibleBottom = isDocument
        ? viewportBottom
        : Math.min(
            viewportBottom,
            containerRect.top + container.clientTop + container.clientHeight,
          );

      const gap = 16;
      const fieldRect = field.getBoundingClientRect();
      const availableHeight = visibleBottom - visibleTop - gap * 2;

      if (availableHeight <= 0) return;

      let delta = 0;

      if (
        fieldRect.top < visibleTop + gap ||
        fieldRect.height > availableHeight
      ) {
        delta = fieldRect.top - (visibleTop + gap);
      } else if (fieldRect.bottom > visibleBottom - gap) {
        delta = fieldRect.bottom - (visibleBottom - gap);
      }

      // Leave already-visible inputs in place.
      if (Math.abs(delta) > 1) {
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
      window.removeEventListener("orientationchange", handleOrientation);

      clearTimeout(timer);
      clear();
    };
  }, []);

  return null;
}
