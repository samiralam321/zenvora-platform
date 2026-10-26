"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When the path or query parameters change, complete and reset the transition
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
      setProgress(15);

      // Smooth multi-step progression
      const t1 = setTimeout(() => setProgress(45), 60);
      const t2 = setTimeout(() => setProgress(75), 180);
      const t3 = setTimeout(() => setProgress(90), 400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 250);
    };

    window.addEventListener("zenvora:nav-start", handleStart);
    window.addEventListener("zenvora:nav-complete", handleComplete);

    return () => {
      window.removeEventListener("zenvora:nav-start", handleStart);
      window.removeEventListener("zenvora:nav-complete", handleComplete);
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <>
      {/* Top glowing progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none overflow-hidden"
        style={{ background: "transparent" }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#1D64EC] via-[#3B82F6] to-[#60A5FA] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(29,100,236,0.9),0_0_4px_rgba(255,255,255,0.8)]"
          style={{
            width: `${progress}%`,
            transitionProperty: "width, opacity",
            opacity: progress === 100 ? 0 : 1,
            transitionDuration: progress === 100 ? "250ms" : "300ms",
          }}
        />
      </div>

      {/* Gentle smooth screen aura during transition */}
      <div
        className="fixed inset-0 z-[99998] pointer-events-none transition-opacity duration-300 ease-out"
        style={{
          background: "radial-gradient(circle at 50% 20%, rgba(29, 100, 236, 0.04) 0%, transparent 70%)",
          opacity: isNavigating ? 1 : 0,
        }}
      />
    </>
  );
}

/**
 * Utility helper to dispatch a smooth navigation event
 */
export function startSmoothNavigation() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zenvora:nav-start"));
  }
}
