"use client";

import React, { useEffect, useRef } from "react";

interface ScrollFeedProps {
  children: React.ReactNode[];
}

export const ScrollFeed: React.FC<ScrollFeedProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  let isSnapping = false;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (isSnapping) return;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const sectionHeight = window.innerHeight;
        const scrollTop = container.scrollTop;
        const index = Math.round(scrollTop / sectionHeight);
        const target = index * sectionHeight;

         isSnapping = true;
        // container.scrollTo({
        //   top: target,
        //   behavior: "auto", // use "smooth" for softer scroll
        // });
        container.scrollTop = target;

        setTimeout(() => {
          isSnapping = false;
        }, 100); // debounce
      }, ); // wait for scroll to stop
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-dvh overflow-y-scroll snap-y bg-black"
      style={{
        scrollSnapType: "y mandatory",
        overscrollBehaviorY: "contain",
      }}
    >
      {children.map((child, index) => (
        <section
          key={index}
          className="h-dvh snap-start flex justify-center items-center bg-black"
        >
          {child}
        </section>
      ))}
    </div>
  );
};
