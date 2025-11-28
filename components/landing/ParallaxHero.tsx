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
  const titleRef = useRef<HTMLDivElement>(null);

  // New Hero refs
  const newHeroContentRef = useRef<HTMLDivElement>(null);
  const stickersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll position on load
    window.scrollTo(0, 0);

    let ctx: gsap.Context | null = null;

    const initAnimation = () => {
      // Clear any existing ScrollTriggers
      ScrollTrigger.getAll().forEach(st => st.kill());

      ctx = gsap.context(() => {
        // Check if mobile
        const isMobile = window.innerWidth < 768;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: isMobile ? "+=150%" : "+=300%",
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
        gsap.set(titleRef.current, { opacity: 0, y: -30 });

        // New Hero initial states
        gsap.set([newHeroContentRef.current, stickersRef.current], {
          opacity: 1,
          y: 0
        });

        // Phase 1: Fade out the new hero content (including phone mockup)
        tl.to([newHeroContentRef.current, stickersRef.current], {
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
              y: "0%",
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

          // Phase 5: Fade in title at the top
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
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {/* Background - Cream gradient that transitions to parallax scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5] via-[#f5f0eb] to-[#e8ddd5]" style={{ zIndex: 0 }} />

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
          className="absolute bottom-0 left-0 w-full h-full opacity-0"
          style={{ zIndex: 2 }}
        >
          <Image
            src="https://64.media.tumblr.com/37bc173fffcb0a40e9faf78fdfaeee24/bae8db4a111313c4-83/s2048x3072/b8a01598b678aae29a7608b753eae14d10c61a59.pnj"
            alt="Distant mountains"
            fill
            className="object-cover"
            style={{ objectPosition: "center bottom" }}
            priority
          />
        </div>

        {/* Mountains Layer - positioned at bottom, aligned to reference */}
        <div
          ref={mountainsRef}
          className="absolute inset-0 w-full h-full opacity-0"
          style={{ zIndex: 4 }}
          >
          <Image
            src="https://64.media.tumblr.com/ab03c44c855f537dff84f34dba79ebc2/bae8db4a111313c4-1b/s2048x3072/70602e7a2f75388f56e126ee5b4859af99f9dc66.pnj"
            alt="Distant mountains"
            fill
            className="object-cover"
            style={{ objectPosition: "center bottom" }}
            priority
          />
        </div>

        {/* Stone Wall Layer - right side, bottom aligned */}
        <div
          ref={wallRef}
          className="absolute bottom-0 right-0 w-full opacity-0"
          style={{ transform: "translateX(50%)", transformOrigin: "right bottom", zIndex: 4, height: "100%", width: "100%" }}
        >
          <Image
            src="https://64.media.tumblr.com/98ca1d1ec80ca595d894b7afa3e2ca32/bae8db4a111313c4-91/s2048x3072/1b7e861a3163a16ed5868158627d9aedd755dff6.pnj"
            alt="Stone wall"
            fill
            className="object-contain object-bottom"
            style={{ objectPosition: "right bottom" }}
            priority
          />
        </div>

        {/* Grass/Foreground with Couple  Layer - bottom of screen */}
        <div
          ref={grassRef}
          className="absolute bottom-0 left-0 w-full opacity-0"
          style={{ transform: "translateY(40%)", transformOrigin: "bottom", zIndex: 5, height: "100%", width: "100%" }}
        >
          <Image
            src="https://64.media.tumblr.com/fdac826a79363abb3be090ce78ded30b/b04d6acd6ad176b0-9d/s2048x3072/207f47e23d68f79d57d53094bb83c820be9f280d.pnj"
            alt="Foreground grass"
            fill
            className="object-cover object-bottom"
            style={{ objectPosition: "center bottom" }}
            priority
          />
        </div>

      </div>

      {/* Scattered Stickers - Responsive positioning */}
      <div ref={stickersRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
       

       
      </div>

      {/* Main New Hero Content */}
      <div ref={newHeroContentRef} className="relative z-10 container mx-auto px-3 sm:px-4 h-screen lg:h-auto flex items-center lg:block pt-0 lg:pt-64 pb-0 lg:pb-20" style={{ zIndex: 12 }}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-0 sm:gap-0 lg:gap-0 xl:gap-0 w-full">

          {/* Right side - Text Content */}

          <div className="flex-1 text-center lg:text-right order-2 lg:order-1 max-w-2xl lg:max-w-none">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-[#4a4a4a] mb-4 sm:mb-6">
            <span className="block text-transparent bg-clip-text bg-gradient-to-l from-primary to-accent !leading-[1] pb-1"> לונסול</span>
              <span className="block !leading-[1]">ניהול אירועים </span>
              <span className="block !leading-[1]">
                בקליק אחד 
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl text-[#6e6262]/80 mb-6 sm:mb-8 max-w-lg sm:max-w-xl mx-auto lg:mx-0 lg:mr-0 px-2 sm:px-0 leading-relaxed">
              אישורי הגעה בוואטסאפ, ניהול אורחים, סידור הושבה אוטומטי ומעקב מתנות - <strong className="text-[#6e6262]">הכל במקום אחד בחינם!</strong>
            </p>

            {/* CTA Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8 px-4 sm:px-0">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-xl">
                  הרשמו בחינם
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-lg border-2 border-[#6e6262]/30 text-[#6e6262] hover:bg-[#6e6262]/5">
                  התחברו
                </Button>
              </Link>
            </div> */}

            {/* Lunsol Benefits Title */}
            <div className="">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#4a4a4a] text-center lg:text-right">
                <span className="text-primary">לונסול</span> מעניקה לכם
              </h3>
              <div className="w-16 sm:w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto lg:mx-0 mt-2 rounded-full"></div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 md:gap-8">
              <div className="text-center min-w-[70px] sm:min-w-[80px]">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-[#4a4a4a]">200</div>
                <div className="text-xs sm:text-sm text-[#6e6262]/80">אורחים בחינם</div>
              </div>
              <div className="text-center min-w-[70px] sm:min-w-[80px]">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-[#4a4a4a]">100%</div>
                <div className="text-xs sm:text-sm text-[#6e6262]/80">אוטומטי</div>
              </div>
              <div className="text-center min-w-[70px] sm:min-w-[80px]">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-[#4a4a4a]">0₪</div>
                <div className="text-xs sm:text-sm text-[#6e6262]/80">להתחלה</div>
              </div>
            </div>

            {/* Bottom Features - inside content for mobile */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 mt-6 sm:mt-8">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-xs sm:text-sm text-[#6e6262]/80">שליחה אוטומטית בוואטסאפ</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs sm:text-sm text-[#6e6262]/80">ניהול אורחים וסידור הושבה</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm text-[#6e6262]/80">מעקב מתנות ותשלומים</span>
              </div>
            </div>

            {/* Scroll indicator - mobile only */}
            <div
              className="flex flex-col items-center mt-6 sm:mt-8 lg:hidden cursor-pointer"
              onClick={() => {
                const nextSection = document.querySelector('section');
                if (nextSection) {
                  const targetPosition = nextSection.getBoundingClientRect().top + window.pageYOffset;
                  const startPosition = window.pageYOffset;
                  const distance = targetPosition - startPosition;
                  const duration = 7000; // 7 seconds - slow scroll to enjoy the parallax
                  let start: number | null = null;

                  const animation = (currentTime: number) => {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const progress = Math.min(timeElapsed / duration, 1);
                    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
                    window.scrollTo(0, startPosition + distance * easeOutQuad);
                    if (timeElapsed < duration) {
                      requestAnimationFrame(animation);
                    }
                  };
                  requestAnimationFrame(animation);
                }
              }}
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#6e6262]/50 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Left side - Hero Image - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 justify-center order-1 lg:order-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              <Image
                src="https://64.media.tumblr.com/596d509eceb64789ebd730498a379137/94be2bf781ea31b4-32/s2048x3072/1f3cb6bcfcb6417c0fca9059b5754c4be8c5e550.pnj"
                alt="Wedding couple"
                width={500}
                height={600}
                className="object-contain max-h-[70vh] w-auto"
                style={{ filter: 'drop-shadow(0 25px 50px rgba(139, 92, 246, 0.4))' }}
                priority
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator - desktop only, below both columns */}
        <div
          className="hidden lg:flex flex-col items-center mt-6 cursor-pointer"
          onClick={() => {
            const nextSection = document.querySelector('section');
            if (nextSection) {
              const targetPosition = nextSection.getBoundingClientRect().top + window.pageYOffset;
              const startPosition = window.pageYOffset;
              const distance = targetPosition - startPosition;
              const duration = 7000; // 8 seconds - slow scroll to enjoy the parallax
              let start: number | null = null;

              const animation = (currentTime: number) => {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const progress = Math.min(timeElapsed / duration, 1);
                // easeOutQuad - starts normal, slows down at the end
                const easeOutQuad = 1 - (1 - progress) * (1 - progress);
                window.scrollTo(0, startPosition + distance * easeOutQuad);
                if (timeElapsed < duration) {
                  requestAnimationFrame(animation);
                }
              };
              requestAnimationFrame(animation);
            }
          }}
        >
          <svg className="w-8 h-8 xl:w-10 xl:h-10 text-[#6e6262]/50 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Title - Appears at the end at the top - responsive */}
      <div
        ref={titleRef}
        className="absolute top-32 sm:top-40 md:top-48 lg:top-56 left-1/2 -translate-x-1/2 text-center opacity-0 w-full px-4"
        style={{ zIndex: 15 }}
      >
        <h2
          className="text-5xl sm:text-5xl  lg:text-7xl xl:text-8xl text-[#b8966d] drop-shadow-2xl"
          style={{ fontFamily: 'var(--font-wedding)' }}
        >
          Save The Date
        </h2>
      </div>

      {/* Scroll indicator gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
        style={{ zIndex: 6 }}
      />
    </div>
  );
}
