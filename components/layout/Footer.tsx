import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#331c43] text-gray-300">
      <div className="max-w-7xl mx-auto sm:px-1 lg:px-2 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Right side - Links */}
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            <Link
              href="/terms"
              className="hover:text-white transition-colors text-sm"
            >
              תקנון
            </Link>
            <Link
              href="/accessibility"
              className="hover:text-white transition-colors text-sm"
            >
              הצהרת נגישות
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors text-sm"
            >
              מדיניות פרטיות
            </Link>
            <a
              href="mailto:lironamy@gmail.com"
              className="hover:text-white transition-colors text-sm"
            >
              יצירת קשר
            </a>
          </div>

          {/* Left side - Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm">
              © 2025 לונסול. כל הזכויות שמורות.
            </p>
          </div>
        </div>

        {/* Optional: Additional info or social links can go here */}
        <div className="mt-1 pt-1 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            פלטפורמה מקיפה לניהול חתונות - הזמנות דיגיטליות, ניהול אורחים ותקשורת אוטומטית
          </p>
        </div>
      </div>
    </footer>
  );
}
