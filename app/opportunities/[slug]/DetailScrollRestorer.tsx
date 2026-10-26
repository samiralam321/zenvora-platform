"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

const STORAGE_PREFIX = "zenvora_detail_scroll_";

/**
 * Saves scroll position for the current detail page slug and restores it on mount.
 * Also saves scroll position when the user navigates away (beforeunload + link clicks).
 */
export default function DetailScrollRestorer({ slug }: { slug: string }) {
  const key = `${STORAGE_PREFIX}${slug}`;

  // Restore on mount — useLayoutEffect fires before browser paint to avoid flash
  useLayoutEffect(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const y = parseInt(saved, 10);
        if (y > 0) {
          // requestAnimationFrame ensures the DOM is fully painted before scroll
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: "instant" });
          });
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Save scroll continuously as user reads
  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem(key, String(window.scrollY));
      } catch {}
    };

    window.addEventListener("scroll", save, { passive: true });

    // Also save right before the page unloads
    window.addEventListener("beforeunload", save);

    return () => {
      save(); // save on unmount (client-side navigation away)
      window.removeEventListener("scroll", save);
      window.removeEventListener("beforeunload", save);
    };
  }, [key]);

  return null; // renders nothing
}
