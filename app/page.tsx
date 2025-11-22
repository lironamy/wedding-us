import Link from "next/link";
import { Button } from "@/components/ui";
import ParallaxHero from "@/components/landing/ParallaxHero";
import InvitationShowcase from "@/components/landing/InvitationShowcase";
import WhatsAppShowcase from "@/components/landing/WhatsAppShowcase";
import AnimatedFeatures from "@/components/landing/AnimatedFeatures";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">פלטפורמת חתונות</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">התחבר</Button>
            </Link>
            <Link href="/register">
              <Button>הירשם</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Parallax Hero Section */}
      <ParallaxHero />

      {/* Invitation Showcase - Video Section */}
      <InvitationShowcase />

      {/* Animated Features Section */}
      <AnimatedFeatures />

      {/* WhatsApp Showcase Section */}
      <WhatsAppShowcase />

      {/* How It Works Section */}
      <HowItWorks />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 פלטפורמת חתונות. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="py-32 overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#6e6262] text-center mb-20">
          איך זה עובד?
        </h2>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
            <StepCard
              number={1}
              title="הירשמו"
              description="צרו חשבון בחינם תוך שניות ותתחילו מיד"
              icon="✨"
            />
            <div className="hidden md:flex items-center">
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <StepCard
              number={2}
              title="הגדירו"
              description="הוסיפו אורחים ועצבו את ההזמנה המושלמת"
              icon="🎨"
            />
            <div className="hidden md:flex items-center">
              <div className="w-20 h-1 bg-gradient-to-r from-accent to-primary rounded-full" />
            </div>
            <StepCard
              number={3}
              title="שלחו"
              description="שלחו הזמנות ועקבו אחר אישורים בזמן אמת"
              icon="🚀"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center text-center bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
          {number}
        </div>
        <span className="absolute -top-2 -right-2 text-3xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-[#6e6262] mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          מוכנים להתחיל?
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
          הצטרפו לאלפי זוגות שכבר מנהלים את החתונה שלהם בקלות ובסטייל
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button
              size="lg"
              className="text-xl px-12 py-8 bg-white !text-[#C4A57B] hover:bg-white/90 shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
            >
              התחילו עכשיו - חינם
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="text-xl px-12 py-8 bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
            >
              יש לי חשבון
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
