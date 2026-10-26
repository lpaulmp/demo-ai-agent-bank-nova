import { useEffect } from 'react';

// Same breakpoint as the full-screen chat panel in styles/agent.css.
const PHONE_QUERY = '(max-width: 640px)';

export function isPhone(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.(PHONE_QUERY).matches;
}

/** Touch screens open the on-screen keyboard on focus, so the chat should not autofocus there. */
export function isTouch(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
}

/**
 * Keeps the full-screen chat panel inside the visible part of the screen on phones.
 *
 * iOS Safari does not shrink the layout for the keyboard: it scrolls the page instead, so a
 * `position: fixed; height: 100dvh` panel ends up with its header (and the close button) above the
 * screen. While the panel is open this pins the page scroll and sizes the panel to the visual
 * viewport. Nothing happens on wider screens, where the panel floats.
 */
export function useMobilePanel(panel: React.RefObject<HTMLElement | null>, open: boolean) {
  useEffect(() => {
    if (!open || !isPhone()) return;
    const el = panel.current;
    const vv = window.visualViewport;
    const body = document.body.style;
    const previousOverflow = body.overflow;
    body.overflow = 'hidden';

    function fit() {
      if (!el || !vv) return;
      el.style.height = `${vv.height}px`;
      el.style.transform = `translateY(${vv.offsetTop}px)`;
    }
    fit();
    vv?.addEventListener('resize', fit);
    vv?.addEventListener('scroll', fit);
    return () => {
      vv?.removeEventListener('resize', fit);
      vv?.removeEventListener('scroll', fit);
      body.overflow = previousOverflow;
      if (el) {
        el.style.height = '';
        el.style.transform = '';
      }
    };
  }, [panel, open]);
}
