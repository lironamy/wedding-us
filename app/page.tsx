import Link from "next/link";
import { Button } from "@/components/ui";
import ParallaxHero from "@/components/landing/ParallaxHero";

export default function Home() {
  return (
    <div className="min-h-screen">
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

      {/* Features Section */}
      <section className="bg-gradient-to-br from-accent via-white to-muted py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#6e6262] mb-4">
              הכל במקום אחד
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              פלטפורמה מקיפה לניהול הזמנות לחתונה, אישורי הגעה, סידורי ישיבה ומעקב אחר מתנות
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              title="הזמנות דיגיטליות"
              description="צור הזמנות אלגנטיות עם תמונות וסרטונים, התאם אישית את העיצוב והצבעים"
              icon="📧"
            />
            <FeatureCard
              title="ניהול אורחים"
              description="ייבוא אורחים מאקסל, מעקב אחר אישורי הגעה, וניהול קבוצות משפחתיות"
              icon="👥"
            />
            <FeatureCard
              title="הודעות WhatsApp"
              description="שלח הזמנות ותזכורות דרך WhatsApp באופן אוטומטי עם קישורים מותאמים אישית"
              icon="💬"
            />
            <FeatureCard
              title="סידורי ישיבה"
              description="נהל שולחנות וסדר את האורחים בקלות עם ממשק גרירה ושחרור"
              icon="🪑"
            />
            <FeatureCard
              title="מעקב מתנות"
              description="עקוב אחר מתנות שהתקבלו באמצעות Bit ו-Paybox בקלות"
              icon="🎁"
            />
            <FeatureCard
              title="דוחות וסטטיסטיקות"
              description="קבל תמונה מלאה של אישורי ההגעה, מספר האורחים והמתנות"
              icon="📊"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-[#6e6262] text-center mb-16">
            איך זה עובד?
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <StepCard number={1} title="הירשמו" description="צרו חשבון בחינם תוך שניות" />
              <div className="hidden md:block w-16 h-1 bg-primary/30" />
              <StepCard number={2} title="הגדירו" description="הוסיפו אורחים ועצבו את ההזמנה" />
              <div className="hidden md:block w-16 h-1 bg-primary/30" />
              <StepCard number={3} title="שלחו" description="שלחו הזמנות ועקבו אחר אישורים" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            מוכנים להתחיל?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            הצטרפו לאלפי זוגות שכבר מנהלים את החתונה שלהם בקלות
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="text-lg px-10 py-6 bg-white text-primary hover:bg-white/90"
            >
              התחילו עכשיו - חינם
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 פלטפורמת חתונות. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-[#6e6262]">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-[#6e6262] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
