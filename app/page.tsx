import Link from "next/link";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-white to-muted">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
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

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-[#6e6262] mb-6">
            החתונה שלכם, בניהול מושלם
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            פלטפורמה מקיפה לניהול הזמנות לחתונה, אישורי הגעה, סידורי ישיבה ומעקב אחר מתנות.
            <br />
            הכל במקום אחד, פשוט ונוח.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                התחל עכשיו - חינם
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                התחבר לחשבון
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 bg-white">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 פלטפורמת חתונות. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-[#6e6262]">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
