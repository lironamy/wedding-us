"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const distantMountainsRef = useRef<HTMLDivElement>(null);
  const mountainsRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const grassRef = useRef<HTMLDivElement>(null);
  const coupleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll position on load
    window.scrollTo(0, 0);

    let ctx: gsap.Context | null = null;

    const initAnimation = () => {
      // Clear any existing ScrollTriggers
      ScrollTrigger.getAll().forEach(st => st.kill());

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=300%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Initial states - layers start from different positions
        gsap.set(distantMountainsRef.current, { y: "20%", opacity: 0 });
        gsap.set(mountainsRef.current, { y: "30%", opacity: 0 });
        gsap.set(wallRef.current, { x: "50%", opacity: 0 });
        gsap.set(grassRef.current, { y: "40%", opacity: 0 });
        gsap.set(coupleRef.current, { y: "20%", opacity: 0, scale: 0.9 });
        gsap.set(contentRef.current, { opacity: 1, y: 0 });
        gsap.set(ctaRef.current, { opacity: 0, y: 50 });
        gsap.set(titleRef.current, { opacity: 0, y: -30 });

        // Phase 1: Fade out the initial content and bring in distant mountains
        tl.to(contentRef.current, {
          opacity: 0,
          y: -100,
          duration: 0.5,
          ease: "power2.inOut",
        })
          .to(
            distantMountainsRef.current,
            {
              y: "0%",
              opacity: 1,
              duration: 1,
              ease: "power2.out",
            },
            "<0.2"
          )

          // Phase 2: Bring in the closer mountains
          .to(
            mountainsRef.current,
            {
              y: "-7%",
              opacity: 1,
              duration: 1,
              ease: "power2.out",
            },
            "-=0.5"
          )

          // Phase 3: Bring in the stone wall from right
          .to(
            wallRef.current,
            {
              x: "0%",
              opacity: 1,
              duration: 1,
              ease: "power2.out",
            },
            "-=0.3"
          )

          // Phase 4: Bring in the foreground grass from below
          .to(
            grassRef.current,
            {
              y: "0%",
              opacity: 1,
              duration: 1,
              ease: "power2.out",
            },
            "-=0.5"
          )

          // Phase 5: Couple appears with a gentle entrance
          .to(
            coupleRef.current,
            {
              y: "0%",
              opacity: 1,
              scale: 1,
              duration: 1.2,
              ease: "back.out(1.2)",
            },
            "-=0.3"
          )

          // Phase 6: Show CTA buttons
          .to(
            ctaRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            "-=0.5"
          )

          // Phase 7: Fade in title at the top
          .to(
            titleRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            "-=0.5"
          );

        // Add subtle parallax movement while scrolling
        gsap.to(skyRef.current, {
          y: "-5%",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=300%",
            scrub: 2,
          },
        });

        // Refresh ScrollTrigger after setup
        ScrollTrigger.refresh();

      }, containerRef);
    };

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initAnimation();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#e8ddd5]">
      {/* Scene container - maintains aspect ratio */}
      <div
        ref={sceneRef}
        className="absolute inset-0 w-full h-full flex items-end justify-center"
      >
        {/* Sky Layer - Base (full coverage) */}
        <div
          ref={skyRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        >
          <Image
            src="https://64.media.tumblr.com/e14c61f984665c563726e50ba74bb0e9/8b9c4c2b95d9bd79-ee/s2048x3072/dbb91d0b249c92477b4def4cc73acb53fa1710f4.jpg"
            alt="Sky background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Distant Mountains Layer - behind the main mountains */}
        <div
          ref={distantMountainsRef}
          className="absolute bottom-0 left-0 w-full h-full"
          style={{ transform: "translateY(0%) scale(.74)", transformOrigin: "right bottom", zIndex: 2, height: "100%", width: "100%" }}
        >
          <Image
            src="https://64.media.tumblr.com/7802cce924a4d5087a255960e74af4ae/593ef8231c3e26da-ba/s2048x3072/60a74dc66612c1ee67f3fb42b56fe6ee9b23640a.pnj"
            alt="Distant mountains"
            fill
            className="object-contain"
            style={{ objectPosition: "center bottom" }}
            priority
          />
        </div>

        {/* Mountains Layer - positioned at bottom, aligned to reference */}
        <div
          ref={mountainsRef}
          className="absolute bottom-0 left-0 w-full"
          style={{ transform: "translateY(-5%) scale(1.15)", zIndex: 3, height: "100%", width: "100%" }}
          >
          <Image
            src="https://64.media.tumblr.com/66964aa4bffe7f06c83c22ce3def6619/8b9c4c2b95d9bd79-25/s2048x3072/de5453ab92b0fa4c160f9a3fd567d973b88ed4de.pnj"
            alt="Distant mountains"
            fill
            className="object-contain"
            style={{ objectPosition: "center bottom" }}
            priority
          />
        </div>

        {/* Stone Wall Layer - right side, bottom aligned */}
        <div
          ref={wallRef}
          className="absolute bottom-0 right-0 w-full"
          style={{ transform: "translateY(-2%) scale(.95)", transformOrigin: "right bottom", zIndex: 4, height: "100%", width: "100%" }}
        >
          <Image
            src="https://64.media.tumblr.com/d14b90ab45c4e3511f1586dc638871a7/8b9c4c2b95d9bd79-43/s2048x3072/f4f216bca3d62e92e6657115f50cd099a12b816f.pnj"
            alt="Stone wall"
            fill
            className="object-contain object-bottom"
            style={{ objectPosition: "right bottom" }}
            priority
          />
        </div>

        {/* Grass/Foreground Layer - bottom of screen */}
        <div
          ref={grassRef}
          className="absolute bottom-0 left-0 w-full"
          style={{ transform: "translateY(2%) scale(1.2)", transformOrigin: "bottom", zIndex: 5, height: "100%", width: "100%" }}
        >
          <Image
            src="https://64.media.tumblr.com/071bc2a1122d7e1bd0475dd00afa917b/8b9c4c2b95d9bd79-3f/s2048x3072/2986ce81a90d4f0c2648b2d989494fe1b7b02b10.pnj"
            alt="Foreground grass"
            fill
            className="object-contain object-bottom"
            style={{ objectPosition: "center bottom" }}
            priority
          />
        </div>

        {/* Couple Layer - center bottom */}
        <div
          ref={coupleRef}
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{ zIndex: 6, height: "2330px", width: "2330px" }}
        >
          <Image
            src="https://64.media.tumblr.com/78dd63b7d065945bef351bd8a67bdadf/8b9c4c2b95d9bd79-fd/s2048x3072/00adeb71a60bd2f0ca6a347ce0dd661e7671740f.pnj"
            alt="Bride and Groom"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>

      </div>

      {/* Initial Content Overlay */}
      <div
        ref={contentRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        style={{ zIndex: 10 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold text-[#6e6262] mb-6 drop-shadow-lg">
          החתונה שלכם
        </h1>
        <p className="text-xl md:text-2xl text-[#6e6262]/80 mb-4 drop-shadow-md max-w-2xl">
          בניהול מושלם
        </p>
        <div className="animate-bounce mt-8">
          <svg
            className="w-8 h-8 text-[#6e6262] drop-shadow-md"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Title - Appears at the end at the top */}
      <div
        ref={titleRef}
        className="absolute top-56 left-1/2 -translate-x-1/2 text-center"
        style={{ zIndex: 15 }}
      >
        <h2 className="text-4xl md:text-6xl mb-5 font-bold text-zinc-400 drop-shadow-2xl">
          התחילו את המסע שלכם
        </h2>

        <Link href="/register">
          <Button
            size="lg"
            variant="outline" 
            className="text-lg px-8 py-6 bg-transparent border-zinc-400 hover:border-accent/20 cursor- text-zinc-400 hover:bg-accent/20 shadow-2xl backdrop-blur-sm"
          >
            התחברו לחשבון
          </Button>
        </Link>
      </div>

     

      {/* Scroll indicator gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
        style={{ zIndex: 6 }}
      />
    </div>
  );
}
