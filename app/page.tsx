'use client';

import { useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import ParallaxHero from "@/components/landing/ParallaxHero";
import InvitationShowcase from "@/components/landing/InvitationShowcase";
import WhatsAppShowcase from "@/components/landing/WhatsAppShowcase";
import AnimatedFeatures from "@/components/landing/AnimatedFeatures";
import LightRays from "@/components/ui/LightRays";
import TargetCursor from "@/components/ui/TargetCursor";
import CurvedDivider from "@/components/ui/CurvedDivider";


export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
              <Image
                src="https://64.media.tumblr.com/31c16aacb75e390f1f2a295ea5d87602/0f61bf9fa2b6d79b-b2/s1280x1920/8e0edcc6f68a6d914e6590f4a91c525f2479990b.pnj"
                alt="LunSoul logo"
                width={180}
                height={54}
                priority
                className="h-10 w-auto object-contain"
              />  
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="rounded-lg border-[#6e6262]/30 text-[#6e6262] hover:bg-[#6e6262]/5">התחברו</Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-lg">הרשמו</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <ParallaxHero />

      {/* Invitation Showcase - Video Section */}
      <InvitationShowcase />

      {/* Curved divider - Invitation to Features */}
      <CurvedDivider fillColor="#ffffff" bgColor="#FAFAFA" />

      {/* Animated Features Section */}
      <AnimatedFeatures />

      {/* Curved divider - Features to WhatsApp */}
      <CurvedDivider fillColor="#f8f5f2" bgColor="#ffffff" />

      {/* WhatsApp Showcase Section */}
      <WhatsAppShowcase />

      {/* Curved divider - WhatsApp to HowItWorks */}
      <CurvedDivider fillColor="#f9fafb" bgColor="#f8f5f2" />

      {/* How It Works Section */}
      <HowItWorks />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "הירשמו",
      description: "צרו חשבון בחינם תוך שניות ותתחילו מיד",
      icon: "✨",
    },
    {
      number: 2,
      title: "הגדירו",
      description: "הוסיפו אורחים ועצבו את ההזמנה המושלמת",
      icon: "🎨",
    },
    {
      number: 3,
      title: "שלחו",
      description: "שלחו הזמנות ועקבו אחר אישורים בזמן אמת",
      icon: "🚀",
    },
  ];

  return (
    <section className="pb-16  md:py-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            פשוט וקל
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#6e6262] mb-3">
            איך זה עובד?
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            שלושה צעדים פשוטים לחתונה מאורגנת
          </p>
        </div>

        {/* Timeline Design */}
        <div className="max-w-4xl mx-auto relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-[70%] h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative group"
              >
                {/* Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Number Badge */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          {step.number}
                        </div>
                        {/* Pulse effect - only on hover */}
                        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary to-accent opacity-0 group-hover:opacity-30 group-hover:animate-ping" style={{ animationDuration: '2s' }} />
                      </div>
                    </div>

                    {/* Text */}
                    <h3 className="text-lg md:text-xl font-bold text-[#6e6262] mb-2 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 text-center text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="py-32 relative overflow-hidden min-h-[500px]">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary via-primary/90 to-accent" />

      {/* Light Rays Animation */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={1.8}
        rayLength={3}
        fadeDistance={2}
        saturation={1}
        pulsating={true}
        followMouse={false}
        mouseInfluence={1}
        noiseAmount={0}
        distortion={0}
        className="opacity-70"
      />

      {/* Target Cursor - Only in this section */}
      <TargetCursor
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
        containerRef={sectionRef}
      />

      <div className="container mx-auto px-4 text-center relative z-10 py-8">
        <h2 className="cursor-target text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 cta-target inline-block px-4 py-2 cursor-none">
          מוכנים להתחיל?
        </h2>
        <p className="cursor-target text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto cta-target px-4 py-2 cursor-none">
          הצטרפו לאלפי זוגות שכבר מנהלים את החתונה שלהם בקלות ובסטייל
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-center mb-6 sm:mb-8 px-4 sm:px-0">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className=" cursor-target w-full sm:w-auto border-2 border-white text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-xl">
                  הרשמו בחינם
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="cursor-target hover:border-2 hover:border-white w-full bg-indigo-100 sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-lg border-2 border-[#6e6262]/30 text-[#6e6262] hover:bg-[#6e6262]/5">
                  התחברו
                </Button>
              </Link>
            </div>
      </div>
    </section>
  );
}
