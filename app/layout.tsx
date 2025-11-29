import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import { getSession } from "@/lib/auth/get-session";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/layout/Footer";
import AccessibilityWidget from "@/components/accessibility/AccessibilityWidget";

// Force dynamic rendering to ensure session is always checked fresh
export const dynamic = 'force-dynamic';

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "אישורי הגעה וסידור הושבה לחתונה | לונסול",
  description: "פלטפורמה מקיפה לניהול הזמנות לחתונה, אישורי הגעה, וניהול אורחים",
  keywords: ["חתונה", "הזמנה דיגיטלית", "אישור הגעה", "ניהול אורחים"],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${rubik.className} antialiased flex flex-col min-h-screen`}>
        <SessionProvider session={session}>
          <AccessibilityWidget />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                direction: 'rtl',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </SessionProvider>
        {/* Portal for date/time pickers */}
        <div id="datepicker-portal" />
      </body>
    </html>
  );
}
