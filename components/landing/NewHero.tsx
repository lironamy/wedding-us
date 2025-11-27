"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger);

export default function NewHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const stickersRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    let ctx: gsap.Context | null = null;

    const initAnimation = () => {
      ScrollTrigger.getAll().forEach(st => st.kill());

      ctx = gsap.context(() => {
        // Initial states
        gsap.set([contentRef.current, phoneRef.current, stickersRef.current, statsRef.current, featuresRef.current], {
          opacity: 1,
          y: 0
        });

        // Scroll animation - fade out everything
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=100%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        tl.to([contentRef.current, phoneRef.current, stickersRef.current, statsRef.current, featuresRef.current], {
          opacity: 0,
          y: -80,
          duration: 1,
          ease: "power2.inOut",
        });

        ScrollTrigger.refresh();
      }, containerRef);
    };

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
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5] via-[#f5f0eb] to-[#efe8e0]" />

      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-32 h-32 md:w-48 md:h-48 bg-linear-to-br from-primary/30 to-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-40 h-40 md:w-64 md:h-64 bg-linear-to-br from-accent/20 to-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-green-400/20 rounded-full blur-2xl" />

      {/* Scattered Stickers */}
      <div ref={stickersRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {/* Save The Date - Top Left */}
        <div
          className="absolute top-24 left-4 md:left-16 lg:left-24 pointer-events-auto animate-fade-in-up"
          style={{ animationDelay: '0.2s', transform: 'rotate(-8deg)' }}
        >
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full px-4 py-2 md:px-6 md:py-3 shadow-lg text-sm md:text-base font-bold">
            SAVE THE DATE
          </div>
        </div>

        {/* אישורי הגעה - Top Right */}
        <div
          className="absolute top-20 right-4 md:right-16 lg:right-32 pointer-events-auto animate-fade-in-up"
          style={{ animationDelay: '0.4s', transform: 'rotate(5deg)' }}
        >
          <div className="bg-gradient-to-r from-primary to-accent text-white rounded-full px-4 py-2 md:px-6 md:py-3 shadow-lg text-sm md:text-base font-bold">
            אישורי הגעה לאירועים
          </div>
        </div>

        {/* מתנות באשראי - Middle Right */}
        <div
          className="hidden md:block absolute top-1/3 right-8 lg:right-16 pointer-events-auto animate-fade-in-up"
          style={{ animationDelay: '0.6s', transform: 'rotate(3deg)' }}
        >
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full px-5 py-2 shadow-lg text-sm font-bold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            מתנות באשראי
          </div>
        </div>

        {/* עיצוב הזמנות - Bottom Left */}
        <div
          className="absolute bottom-48 md:bottom-56 left-4 md:left-20 pointer-events-auto animate-fade-in-up"
          style={{ animationDelay: '0.8s', transform: 'rotate(-4deg)' }}
        >
          <div className="bg-white/90 backdrop-blur-sm border-2 border-primary/30 rounded-2xl px-4 py-2 shadow-lg text-sm font-semibold text-[#6e6262] flex items-center gap-2">
            <span className="text-lg">🎨</span>
            עיצוב הזמנות בכל שפה
          </div>
        </div>

        {/* WhatsApp - Bottom Right */}
        <div
          className="absolute bottom-40 md:bottom-48 right-4 md:right-24 pointer-events-auto animate-fade-in-up"
          style={{ animationDelay: '1s', transform: 'rotate(6deg)' }}
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-4 py-2 shadow-lg text-sm font-bold flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            אישורי הגעה בוואטסאפ
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-32 left-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-1/4 right-1/4 text-xl" style={{ transform: 'rotate(15deg)' }}>💍</div>
        <div className="absolute bottom-1/3 left-1/4 text-2xl hidden md:block">🎉</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 md:pt-32 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">

          {/* Right side - Text Content */}
          <div ref={contentRef} className="flex-1 text-center lg:text-right order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#6e6262] mb-6 leading-tight">
              <span className="block">הזמנה בסטייל</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-l from-primary to-accent">
                אישור בקליק!
              </span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-[#6e6262]/70 mb-8 max-w-xl mx-auto lg:mx-0 lg:mr-0">
              הדרך הקלה לאורחים שלכם להגיד &apos;כן&apos;.
              <br />
              ניהול אירועים חכם במקום אחד.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8 px-4 sm:px-0">
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
            </div>

            {/* Stats */}
            <div ref={statsRef} className="flex flex-wrap justify-center lg:justify-start gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-[#6e6262]/60">אירועים נוצרו</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">98%</div>
                <div className="text-sm text-[#6e6262]/60">שביעות רצון</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
                <div className="text-sm text-[#6e6262]/60">תמיכה</div>
              </div>
            </div>
          </div>

          {/* Left side - Phone Mockup */}
          <div ref={phoneRef} className="flex-1 flex justify-center order-1 lg:order-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-[280px] md:w-[320px] lg:w-[380px] aspect-[9/19] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-white flex items-center justify-center">
                    <div className="w-20 h-5 bg-gray-900 rounded-full" />
                  </div>

                  {/* App content mockup */}
                  <div className="pt-10 px-4 h-full bg-gradient-to-b from-white to-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20" />
                      <div className="text-center">
                        <div className="font-bold text-[#6e6262] text-sm">החתונה של דנה & יוסי</div>
                        <div className="text-xs text-gray-400">27.11.2025</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">14</span>
                      </div>
                    </div>

                    {/* Invitation preview */}
                    <div className="bg-linear-to-br from-primary/10 to-accent/10 rounded-2xl p-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">💒</div>
                        <div className="font-bold text-[#6e6262]">הוזמנתם!</div>
                        <div className="text-xs text-gray-500 mt-1">אולמי הגן הקסום, תל אביב</div>
                      </div>
                    </div>

                    {/* RSVP buttons */}
                    <div className="space-y-2">
                      <div className="bg-green-500 text-white rounded-xl py-3 text-center text-sm font-semibold flex items-center justify-center gap-2">
                        <span>✓</span> אני מגיע/ה
                      </div>
                      <div className="bg-gray-200 text-gray-600 rounded-xl py-3 text-center text-sm">
                        לא יכול/ה להגיע
                      </div>
                      <div className="bg-gray-200 text-gray-600 rounded-xl py-3 text-center text-sm">
                        עדיין לא יודע/ת
                      </div>
                    </div>

                    {/* Guest count */}
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                      <span>מספר אורחים:</span>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full bg-primary/20 text-primary">-</button>
                        <span className="font-bold text-[#6e6262]">2</span>
                        <button className="w-8 h-8 rounded-full bg-primary/20 text-primary">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating WhatsApp icon */}
              <div className="absolute -left-4 bottom-1/3 w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>

              {/* Floating notification */}
              <div className="absolute -right-2 top-1/4 bg-white rounded-xl p-3 shadow-xl animate-fade-in-up" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#6e6262]">דנה אישרה הגעה</div>
                    <div className="text-[10px] text-gray-400">לפני 2 דקות</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features */}
      <div ref={featuresRef} className="absolute bottom-8 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-sm font-medium text-[#6e6262]">אישורי הגעה בוואטסאפ</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm font-medium text-[#6e6262]">שירות טלפוני אנושי</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-[#6e6262]">מתנות באשראי</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-8 h-8 text-[#6e6262]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}
