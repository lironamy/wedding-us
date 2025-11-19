import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import { getSession } from "@/lib/auth/get-session";

export const metadata: Metadata = {
  title: "פלטפורמת הזמנות לחתונה | Wedding Platform",
  description: "פלטפורמה מקיפה לניהול הזמנות לחתונה, אישורי הגעה, וניהול אורחים",
  keywords: ["חתונה", "הזמנה דיגיטלית", "אישור הגעה", "ניהול אורחים"],
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
