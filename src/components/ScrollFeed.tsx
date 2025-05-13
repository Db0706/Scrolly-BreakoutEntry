"use client";

import React, { useRef, useState, useEffect } from "react";

interface ScrollFeedProps {
  children: React.ReactNode[];
}

export const ScrollFeed: React.FC<ScrollFeedProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  let touchStartY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY = e.changedTouches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const delta = touchStartY - touchEndY;
    if (Math.abs(delta) < 50) return;

    let newIndex = currentIndex;
    if (delta > 0) {
      newIndex = Math.min(currentIndex + 1, children.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    scrollToIndex(newIndex);
    setCurrentIndex(newIndex);
  };

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const vh = window.innerHeight;
    container.scrollTo({ top: index * vh, behavior: "smooth" });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);

    const handleResize = () => {
      scrollToIndex(currentIndex);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentIndex, children.length]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-scroll bg-black"
      style={{
        width: "100vw",
        maxWidth: "100%",
        height: "100svh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        scrollSnapType: "y mandatory",
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children.map((child, idx) => (
        <section
          key={idx}
          className="flex justify-center items-center bg-black"
          style={{
            position: "relative",
            overflow: "hidden",
            width: "100vw",
            height: "100svh",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            contain: "strict",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              overflow: "hidden",
            }}
          >
            {child}
          </div>
        </section>
      ))}
    </div>
  );
};