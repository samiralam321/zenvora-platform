"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  Code2,
  Server,
  Layers,
  Cpu,
  Sparkles,
  Database,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { startSmoothNavigation } from "@/components/NavigationProgress";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  link?: string | null;
}

interface DomainCarousel3DProps {
  categories: CategoryItem[];
}

// ─── Icon resolver ────────────────────────────────────────────────────────────
function getIcon(slug: string, iconName?: string | null) {
  const s = (slug || "").toLowerCase();
  const ic = (iconName || "").toLowerCase();
  const cls = "w-6 h-6 text-[#1D64EC]";
  if (s.includes("backend") || ic.includes("server")) return <Server className={cls} />;
  if (s.includes("full") || ic.includes("layer")) return <Layers className={cls} />;
  if (s.includes("ml") || s.includes("ai-ml") || ic.includes("cpu")) return <Cpu className={cls} />;
  if (s.includes("gen") || ic.includes("sparkle")) return <Sparkles className={cls} />;
  if (s.includes("data") || ic.includes("database")) return <Database className={cls} />;
  if (s.includes("competitive") || s.includes("cp") || ic.includes("trophy")) return <Trophy className={cls} />;
  return <Code2 className={cls} />;
}

// ─── Responsive Horizontal Spacing (12-18px Guaranteed Gap, Zero Collision) ───
function getHorizontalOffset(offset: number, trackWidth: number) {
  const isMobile = trackWidth < 640;
  const isTablet = trackWidth >= 640 && trackWidth < 1024;

  // Card rendered widths:   desktop ~240px, tablet ~200px, mobile ~195px
  // Scale at offset ±1:     0.905  (1 - 0.095)
  // Projected half-widths:  center 120px, neighbor ~108px
  // Required step for 16px gap:  120 + 108 + 16 = 244px → use 260px for comfort
  //
  // Desktop: 268px step — center half(120) + neighbor half(108) + gap ≈ 40px
  // Tablet:  235px step — center half(100) + neighbor half(91)  + gap ≈ 44px
  // Mobile:  210px step — center half(97)  + neighbor half(88)  + gap ≈ 25px
  const step = isMobile ? 210 : isTablet ? 235 : 268;
  return offset * step;
}

// ─── 3D Transform Calculation (Clean Separation, Continuous Smooth Motion) ────
function calcTransform(offset: number, trackWidth = 1200) {
  const absOff = Math.min(Math.abs(offset), 4);
  const sign = offset < 0 ? -1 : 1;

  // Scale: Active center card is 1.0; neighbors scale down gracefully to 0.90, 0.81, 0.72
  const scale = Math.max(0.72, 1 - absOff * 0.095);

  // Subtle perspective rotation (center: 0deg, immediate neighbor: ~6.5deg, outer: ~13deg)
  const rotateY = sign * Math.min(absOff * 6.5, 14);

  // Gentle elevation arc: center card is elevated
  const translateY = Math.min(absOff * 8, 22);

  // True 3D Z-Depth:
  // Active center card sits prominently at +35px; neighbors sit recessed behind
  const translateZ = Math.max(-120, 35 - absOff * 40);

  // Linear constant step ensures adjacent cards NEVER collide or overlap
  const translateX = getHorizontalOffset(offset, trackWidth);

  // Stacking order: card closest to center always has highest z-index
  const zIndex = Math.max(1, Math.round(50 - absOff * 10));

  // Clean fade for cards beyond the 5 visible cards
  const opacity = absOff > 2.3 ? Math.max(0, 1 - (absOff - 2.3) * 1.8) : 1;

  return { scale, rotateY, translateY, translateZ, translateX, zIndex, opacity };
}

// ─── Arc Point for SVG Indicator ──────────────────────────────────────────────
function arcPoint(pct: number): { cx: number; cy: number } {
  const t = Math.max(0, Math.min(1, pct / 100));
  const cx = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 160 + t * t * 310;
  const cy = (1 - t) * (1 - t) * 28 + 2 * (1 - t) * t * 4 + t * t * 28;
  return { cx, cy };
}

// ─── Direct DOM Animation (Bypasses React Re-renders for 120 FPS Fluidity) ────
function applyTransforms(
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  glowRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  reflectionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  dotRef: React.MutableRefObject<SVGCircleElement | null>,
  haloRef: React.MutableRefObject<SVGCircleElement | null>,
  fillRef: React.MutableRefObject<SVGPathElement | null>,
  position: number,
  count: number,
  trackWidth: number,
) {
  for (let i = 0; i < count; i++) {
    const el = cardRefs.current[i];
    if (!el) continue;
    const rawOffset = i - position;
    const {
      scale,
      rotateY,
      translateY,
      translateZ,
      translateX,
      zIndex,
      opacity,
    } = calcTransform(rawOffset, trackWidth);

    // Hardware-accelerated translate3d with explicit Z-depth
    el.style.transform = `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`;
    el.style.zIndex = String(zIndex);
    el.style.opacity = String(opacity);

    // Active card marker attribute
    const isClose = Math.abs(rawOffset) < 0.4;
    el.setAttribute("data-card-active", isClose ? "true" : "false");

    // Dynamic active blue glow ring opacity
    const glow = glowRefs.current[i];
    if (glow) {
      const activeWeight = Math.max(0, 1 - Math.abs(rawOffset) * 2);
      glow.style.opacity = String(activeWeight);
    }

    // Dynamic floor reflection beneath active card
    const refl = reflectionRefs.current[i];
    if (refl) {
      const reflOpacity = Math.max(0, 1 - Math.abs(rawOffset) * 1.5) * 0.45;
      refl.style.opacity = String(reflOpacity);
    }
  }

  // Update SVG progress indicator in lockstep
  if (count > 1) {
    const pct = (position / (count - 1)) * 100;
    const pt = arcPoint(pct);
    if (dotRef.current) {
      dotRef.current.setAttribute("cx", String(pt.cx));
      dotRef.current.setAttribute("cy", String(pt.cy));
    }
    if (haloRef.current) {
      haloRef.current.setAttribute("cx", String(pt.cx));
      haloRef.current.setAttribute("cy", String(pt.cy));
    }
    if (fillRef.current) {
      const dashOffset = 330 - (Math.max(0, Math.min(100, pct)) / 100) * 330;
      fillRef.current.setAttribute("stroke-dashoffset", String(dashOffset));
    }
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DomainCarousel3D({ categories }: DomainCarousel3DProps) {
  const router = useRouter();
  const count = categories.length;
  const startIdx = Math.floor(count / 2);

  // ── Single source of truth: settled integer index for React UI ────────────
  const [activeIndex, setActiveIndex] = useState(startIdx);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [navigatingIdx, setNavigatingIdx] = useState<number | null>(null);

  // ── Refs for smooth animation ─────────────────────────────────────────────
  const cardWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reflectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const trackWidthRef = useRef<number>(1200);
  const progressDotRef = useRef<SVGCircleElement>(null);
  const progressDotHaloRef = useRef<SVGCircleElement>(null);
  const progressFillRef = useRef<SVGPathElement>(null);

  // Fractional position & target position
  const positionRef = useRef(startIdx);
  const targetPos = useRef(startIdx);
  const animRafRef = useRef<number>(0);
  const isAnimating = useRef(false);

  // Drag tracking
  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const hasCapturedPointer = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startPos = useRef(startIdx);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveTime = useRef(0);
  const velocityX = useRef(0);
  const totalDragDistance = useRef(0);
  const dragRafRef = useRef<number>(0);

  // ── Prefers-reduced-motion ────────────────────────────────────────────────
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // ── Render single frame ───────────────────────────────────────────────────
  const renderFrame = useCallback(() => {
    applyTransforms(
      cardWrapRefs,
      glowRefs,
      reflectionRefs,
      progressDotRef,
      progressDotHaloRef,
      progressFillRef,
      positionRef.current,
      count,
      trackWidthRef.current,
    );
  }, [count]);

  // ── Smooth Deceleration Settling (Cubic-Out Easing) ────────────────────────
  const animateTo = useCallback(
    (toIdx: number) => {
      cancelAnimationFrame(animRafRef.current);
      isAnimating.current = true;

      const clampedTarget = Math.max(0, Math.min(count - 1, toIdx));
      targetPos.current = clampedTarget;
      setActiveIndex(clampedTarget);

      if (prefersReducedMotion) {
        positionRef.current = clampedTarget;
        renderFrame();
        isAnimating.current = false;
        return;
      }

      const fromPos = positionRef.current;
      const distance = Math.abs(clampedTarget - fromPos);
      const duration = Math.min(360, Math.max(220, distance * 240));
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth quintic-out deceleration curve
        const ease = 1 - Math.pow(1 - progress, 3.5);

        positionRef.current = fromPos + (clampedTarget - fromPos) * ease;
        renderFrame();

        if (progress < 1) {
          animRafRef.current = requestAnimationFrame(tick);
        } else {
          positionRef.current = clampedTarget;
          renderFrame();
          isAnimating.current = false;
        }
      };

      animRafRef.current = requestAnimationFrame(tick);
    },
    [count, prefersReducedMotion, renderFrame]
  );

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goTo = useCallback(
    (idx: number) => {
      setHasInteracted(true);
      animateTo(idx);
    },
    [animateTo]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  // ── Smooth Page Transition Handler ────────────────────────────────────────
  const handleNavigate = useCallback(
    (index: number, destination: string) => {
      if (totalDragDistance.current > 10) return;
      if (navigatingIdx !== null) return; // Prevent double trigger

      setNavigatingIdx(index);
      startSmoothNavigation();

      // If clicked card is not center, smoothly glide to it
      if (index !== activeIndex) {
        animateTo(index);
      }

      // Smooth transition delay (180ms) for tactile card elevation & top progress animation
      setTimeout(() => {
        router.push(destination);
      }, 180);
    },
    [activeIndex, animateTo, navigatingIdx, router]
  );

  // ── Initial mount & track width observer ──────────────────────────────────
  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current) {
        trackWidthRef.current = trackRef.current.clientWidth;
        renderFrame();
      }
    };
    updateWidth();
    positionRef.current = startIdx;
    targetPos.current = startIdx;
    renderFrame();

    window.addEventListener("resize", updateWidth, { passive: true });
    return () => window.removeEventListener("resize", updateWidth);
  }, [renderFrame, startIdx]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRafRef.current);
      cancelAnimationFrame(dragRafRef.current);
    };
  }, []);

  // ── Pointer Handlers (Mouse & Touch) ──────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    isPointerDown.current = true;
    isDragging.current = false;
    hasCapturedPointer.current = false;
    pointerIdRef.current = e.pointerId;

    startX.current = e.clientX;
    startY.current = e.clientY;
    currentX.current = e.clientX;
    currentY.current = e.clientY;
    startPos.current = positionRef.current;
    lastMoveX.current = e.clientX;
    lastMoveTime.current = performance.now();
    velocityX.current = 0;
    totalDragDistance.current = 0;

    cancelAnimationFrame(animRafRef.current);
    isAnimating.current = false;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDown.current) return;

      currentX.current = e.clientX;
      currentY.current = e.clientY;
      const dx = currentX.current - startX.current;
      const dy = currentY.current - startY.current;
      totalDragDistance.current = Math.max(totalDragDistance.current, Math.abs(dx));

      const now = performance.now();
      const dt = now - lastMoveTime.current;
      if (dt > 8) {
        velocityX.current = (e.clientX - lastMoveX.current) / dt;
        lastMoveX.current = e.clientX;
        lastMoveTime.current = now;
      }

      if (!isDragging.current) {
        if (Math.abs(dx) > 8) {
          if (Math.abs(dy) > Math.abs(dx) * 1.2) {
            isPointerDown.current = false;
            return;
          }

          isDragging.current = true;
          setHasInteracted(true);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
            hasCapturedPointer.current = true;
          } catch {}

          if (trackRef.current) trackRef.current.style.cursor = "grabbing";
        }
      }

      if (!isDragging.current) return;

      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = requestAnimationFrame(() => {
        // True 1:1 pixel tracking: step matches physical card offset exactly
        const step =
          trackWidthRef.current < 640
            ? 210
            : trackWidthRef.current < 1024
            ? 235
            : 268;
        const newPos = startPos.current - dx / step;

        let clampedPos = newPos;
        if (newPos < 0) {
          clampedPos = newPos * 0.28;
        } else if (newPos > count - 1) {
          clampedPos = count - 1 + (newPos - (count - 1)) * 0.28;
        }

        positionRef.current = clampedPos;
        renderFrame();
      });
    },
    [count, renderFrame]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDown.current) return;
      isPointerDown.current = false;

      if (hasCapturedPointer.current && pointerIdRef.current !== null) {
        try {
          e.currentTarget.releasePointerCapture(pointerIdRef.current);
        } catch {}
        hasCapturedPointer.current = false;
      }

      if (trackRef.current) trackRef.current.style.cursor = "grab";

      if (!isDragging.current) return;
      isDragging.current = false;

      const vel = velocityX.current; // px per ms
      // Controlled momentum: clamp to maximum 1.4 cards to avoid runaway skips
      const maxCardsToSkip = 1.4;
      const rawMomentum = Math.max(
        -maxCardsToSkip,
        Math.min(maxCardsToSkip, -vel * 0.22)
      );

      let targetIndex: number;
      if (Math.abs(vel) > 0.35) {
        // Clear flick: move in direction of flick
        targetIndex = Math.round(positionRef.current + rawMomentum);
      } else {
        // Slow release: snap to closest card
        targetIndex = Math.round(positionRef.current);
      }

      targetIndex = Math.max(0, Math.min(count - 1, targetIndex));
      animateTo(targetIndex);

      setTimeout(() => {
        totalDragDistance.current = 0;
      }, 150);
    },
    [count, animateTo]
  );

  // ── Wheel & Trackpad Horizontal Gesture ───────────────────────────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let wheelTimer: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.7) return;
      e.preventDefault();

      clearTimeout(wheelTimer);
      cancelAnimationFrame(animRafRef.current);

      const step =
        trackWidthRef.current < 640
          ? 210
          : trackWidthRef.current < 1024
          ? 235
          : 268;
      positionRef.current = Math.max(
        0,
        Math.min(count - 1, positionRef.current + e.deltaX / step)
      );
      renderFrame();

      wheelTimer = setTimeout(() => {
        animateTo(Math.round(positionRef.current));
      }, 90);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [count, renderFrame, animateTo]);

  // ── Keyboard Controls ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const inTrack = trackRef.current?.contains(activeEl);
      if (!inTrack && activeEl?.tagName !== "BODY") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const progressPercent = count > 1 ? (activeIndex / (count - 1)) * 100 : 50;
  const initialArcPt = arcPoint(progressPercent);

  return (
    <div
      className="relative w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 select-none"
      aria-label="Learning domain carousel"
    >
      {/* ── Left Navigation Arrow ── */}
      <button
        onClick={goPrev}
        disabled={activeIndex === 0}
        aria-label="Previous domain"
        className="absolute left-1 sm:left-1 lg:left-2 top-1/2 -translate-y-1/2 z-40
          w-10 h-10 sm:w-11 sm:h-11 rounded-full
          flex items-center justify-center text-white
          disabled:opacity-20 disabled:cursor-not-allowed
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
          hover:scale-110 active:scale-95 cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        }}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* ── Right Navigation Arrow ── */}
      <button
        onClick={goNext}
        disabled={activeIndex === count - 1}
        aria-label="Next domain"
        className="absolute right-1 sm:right-1 lg:right-2 top-1/2 -translate-y-1/2 z-40
          w-10 h-10 sm:w-11 sm:h-11 rounded-full
          flex items-center justify-center text-white
          disabled:opacity-20 disabled:cursor-not-allowed
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
          hover:scale-110 active:scale-95 cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        }}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* ── Draggable Carousel Track ── */}
      <div
        ref={trackRef}
        data-carousel-track="true"
        className="relative overflow-visible cursor-grab active:cursor-grabbing"
        style={{
          height: "clamp(300px, 38vw, 360px)",
          touchAction: "pan-y",
          userSelect: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Soft radial glow behind carousel center */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: "-20px",
            width: "60%",
            height: "130px",
            background:
              "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(29,100,236,0.35) 0%, transparent 70%)",
            filter: "blur(18px)",
          }}
        />

        {/* Perspective Stage (Flat 3D stacking to prevent mesh clipping) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 40%",
          }}
        >
          {categories.map((cat, i) => {
            const destination = cat.link || `/watch-tutorials?category=${cat.slug}`;
            const isInitialActive = i === startIdx;
            const isNavigatingThis = navigatingIdx === i;

            const rawOffset = i - startIdx;
            const {
              scale,
              rotateY,
              translateY,
              translateZ,
              translateX,
              zIndex,
              opacity,
            } = calcTransform(rawOffset, trackWidthRef.current);

            return (
              <div
                key={cat.id}
                data-card-index={i}
                data-card-active={isInitialActive ? "true" : "false"}
                ref={(el) => {
                  cardWrapRefs.current[i] = el;
                }}
                className="pointer-events-auto"
                style={{
                  position: "absolute",
                  width: "clamp(195px, 19.5vw, 240px)",
                  transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  transformOrigin: "center center",
                  zIndex,
                  opacity,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Card Surface */}
                <div
                  onClick={() => handleNavigate(i, destination)}
                  className={`w-full rounded-2xl p-5 sm:p-5 flex flex-col gap-3 cursor-pointer group relative overflow-hidden transition-all duration-200 ${
                    isNavigatingThis
                      ? "scale-[0.98] ring-2 ring-[#1D64EC]"
                      : "active:scale-[0.99]"
                  }`}
                  style={{
                    height: "clamp(250px, 27vw, 305px)",
                    background: "linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)",
                    border: isNavigatingThis
                      ? "1.5px solid #1D64EC"
                      : "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow: isNavigatingThis
                      ? "0 0 0 2px rgba(29,100,236,0.3), 0 16px 36px -4px rgba(29,100,236,0.35)"
                      : "0 6px 20px -4px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  {/* Active Blue Glow Border Layer */}
                  <div
                    ref={(el) => {
                      glowRefs.current[i] = el;
                    }}
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200"
                    style={{
                      border: "1.5px solid rgba(29, 100, 236, 0.65)",
                      boxShadow:
                        "0 0 0 1px rgba(29,100,236,0.18), 0 12px 36px -4px rgba(29,100,236,0.36)",
                      opacity: isInitialActive || isNavigatingThis ? 1 : 0,
                    }}
                  />

                  {/* Icon medallion */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 relative z-10"
                    style={{
                      background: "linear-gradient(135deg, #EEF4FF 0%, #dbeafe 100%)",
                      border: "1px solid rgba(29, 100, 236, 0.15)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(29,100,236,0.1)",
                    }}
                  >
                    {getIcon(cat.slug, cat.icon)}
                  </div>

                  {/* Title & Description */}
                  <div className="relative z-10 flex-1">
                    <h3
                      className="font-bold text-slate-900 leading-snug group-hover:text-[#1D64EC] transition-colors"
                      style={{ fontSize: "clamp(14px, 1.4vw, 17px)" }}
                    >
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p
                        className="text-slate-500 mt-1.5 leading-relaxed line-clamp-3"
                        style={{ fontSize: "clamp(11.5px, 1.1vw, 13px)" }}
                      >
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* CTA button (Triggers Smooth Page Transition) */}
                  <div className="mt-auto pt-3 border-t border-slate-100/80 relative z-10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(i, destination);
                      }}
                      className="inline-flex items-center gap-1.5 text-[#1D64EC] font-semibold hover:gap-2.5 transition-all duration-200 cursor-pointer text-left"
                      style={{
                        fontSize: "clamp(11.5px, 1.1vw, 13px)",
                      }}
                    >
                      <span>{isNavigatingThis ? "Opening..." : "Explore Track"}</span>
                      <ArrowRight
                        className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 ${
                          isNavigatingThis
                            ? "translate-x-1.5 text-blue-700 animate-pulse"
                            : "group-hover:translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Dynamic floor reflection */}
                <div
                  ref={(el) => {
                    reflectionRefs.current[i] = el;
                  }}
                  className="absolute left-4 right-4 pointer-events-none"
                  style={{
                    top: "100%",
                    height: "40px",
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.14) 0%, transparent 100%)",
                    transform: "scaleY(-1)",
                    filter: "blur(3px)",
                    borderRadius: "0 0 16px 16px",
                    opacity: isInitialActive ? 0.45 : 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Progress Arc & Cue ── */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="relative w-64 sm:w-80 h-8">
          <svg
            viewBox="0 0 320 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            {/* Guide line arc */}
            <path
              d="M 10 28 Q 160 4 310 28"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Filled active arc */}
            <path
              ref={progressFillRef}
              d="M 10 28 Q 160 4 310 28"
              stroke="rgba(29, 100, 236, 0.6)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="330"
              strokeDashoffset={330 - (progressPercent / 100) * 330}
            />
            {/* Indicator Halo */}
            <circle
              ref={progressDotHaloRef}
              cx={initialArcPt.cx}
              cy={initialArcPt.cy}
              r="9"
              fill="rgba(29,100,236,0.2)"
            />
            {/* Indicator Core Dot */}
            <circle
              ref={progressDotRef}
              cx={initialArcPt.cx}
              cy={initialArcPt.cy}
              r="5"
              fill="#1D64EC"
            />
          </svg>
        </div>

        {/* Interaction cue */}
        {!hasInteracted && (
          <div className="flex items-center gap-2 text-white/40 text-xs font-medium mt-1 pointer-events-none animate-pulse">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3a1 1 0 0 1 1 1v6.5l1.5-1.5a1 1 0 1 1 1.414 1.414l-3.207 3.207a1 1 0 0 1-1.414 0L5.086 10.414A1 1 0 1 1 6.5 9l1.5 1.5V4a1 1 0 0 1 1-1zM5 17a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H6a1 1 0 0 1-1-1z" />
            </svg>
            <span>Drag to explore</span>
          </div>
        )}
      </div>
    </div>
  );
}
