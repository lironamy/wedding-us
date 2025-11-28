import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-primary/80 mb-8"
        >
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          חזרה לדף הבית
        </Link>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">מדיניות פרטיות</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. כללי</h2>
              <p>
                מדיניות פרטיות זו מסבירה כיצד לונסול ("אנחנו", "שלנו") אוספת, משתמשת
                ומגנה על המידע האישי שלך בעת שימוש באתר ובשירותים שלנו. אנו מחויבים להגן
                על פרטיותך ולשמור על אבטחת המידע שלך.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. איסוף מידע</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">מידע שאתה מספק</h3>
              <p>אנו אוספים מידע שאתה מספק באופן פעיל:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li><strong>פרטי הרשמה:</strong> שם, כתובת דוא"ל, סיסמה</li>
                <li><strong>פרטי חתונה:</strong> שמות הזוג, תאריך ומקום האירוע</li>
                <li><strong>פרטי אורחים:</strong> שמות, מספרי טלפון נייד, כתובות אימייל</li>
                <li><strong>מידע תשלום:</strong> פרטי כרטיס אשראי (מטופלים על ידי ספק תשלומים חיצוני מאובטח)</li>
                <li><strong>תוכן:</strong> תמונות, הודעות ותכנים שאתה מעלה</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">מידע שנאסף אוטומטית</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li><strong>נתוני שימוש:</strong> דפים שביקרת, זמן שימוש, קליקים</li>
                <li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מכשיר, מערכת הפעלה</li>
                <li><strong>Cookies:</strong> קבצים קטנים המאוחסנים במכשיר שלך לשיפור חווית המשתמש</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. שימוש במידע</h2>
              <p>אנו משתמשים במידע שלך למטרות הבאות:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>מתן שירותי ניהול חתונה ואורחים</li>
                <li>שליחת הודעות WhatsApp לאורחים (באמצעות Twilio)</li>
                <li>יצירת הזמנות דיגיטליות מותאמות אישית</li>
                <li>עיבוד תשלומים (באמצעות Invoice4U)</li>
                <li>שיפור ופיתוח השירותים שלנו</li>
                <li>תקשורת איתך לגבי החשבון והשירותים</li>
                <li>אבטחת האתר ומניעת הונאות</li>
                <li>עמידה בדרישות חוקיות</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. שיתוף מידע</h2>
              <p>אנו לא מוכרים את המידע האישי שלך. אנו עשויים לשתף מידע במקרים הבאים:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong>ספקי שירות:</strong> חברות המסייעות בהפעלת השירותים שלנו:
                  <ul className="list-circle pr-6 mt-2">
                    <li>Twilio (שליחת WhatsApp)</li>
                    <li>Cloudinary (אחסון תמונות)</li>
                    <li>Invoice4U (עיבוד תשלומים)</li>
                    <li>MongoDB Atlas (בסיס נתונים)</li>
                  </ul>
                </li>
                <li><strong>דרישה חוקית:</strong> אם נדרש על פי חוק או צו שיפוטי</li>
                <li><strong>הגנה על זכויות:</strong> למניעת הונאות או פעילות בלתי חוקית</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. אבטחת מידע</h2>
              <p>אנו נוקטים באמצעים טכניים וארגוניים להגנה על המידע שלך:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>הצפנת SSL/TLS לכל התעבורה באתר</li>
                <li>הצפנת סיסמאות באמצעות Bcrypt</li>
                <li>שרתים מאובטחים וגיבוי קבוע של נתונים</li>
                <li>הגבלת גישה למידע רק לעובדים מורשים</li>
                <li>ניטור מתמיד של פעילות חשודה</li>
              </ul>
              <p className="mt-4">
                למרות מאמצינו, אין שיטת העברה או אחסון באינטרנט מאובטחת ב-100%.
                אנו ממליצים לשמור על סיסמאות חזקות וייחודיות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. זכויות המשתמש</h2>
              <p>לך יש הזכויות הבאות לגבי המידע האישי שלך:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li><strong>צפייה:</strong> לצפות במידע האישי שלך</li>
                <li><strong>תיקון:</strong> לתקן מידע שגוי או לא מדויק</li>
                <li><strong>מחיקה:</strong> לבקש מחיקת המידע שלך (בכפוף להגבלות חוקיות)</li>
                <li><strong>העברה:</strong> לקבל את המידע שלך בפורמט ניתן להעברה</li>
                <li><strong>התנגדות:</strong> להתנגד לשימושים מסוימים במידע שלך</li>
                <li><strong>ביטול הסכמה:</strong> לבטל הסכמה שניתנה בעבר</li>
              </ul>
              <p className="mt-4">
                לממש את זכויותיך, פנה אלינו בכתובת:{' '}
                <a href="mailto:lironamy@gmail.com" className="text-primary hover:underline">
                  lironamy@gmail.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <p>
                אנו משתמשים ב-Cookies לשיפור חווית המשתמש, ניתוח שימוש באתר ושמירה על
                העדפות. אתה יכול לחסום Cookies בהגדרות הדפדפן שלך, אך זה עלול להשפיע על
                תפקוד האתר.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. שמירת מידע</h2>
              <p>
                אנו שומרים את המידע שלך כל עוד חשבונך פעיל או כנדרש לספק לך שירותים.
                לאחר מחיקת החשבון, נמחק את המידע האישי שלך תוך 30 יום, אלא אם נדרש לשמור
                אותו לצרכים חוקיים או ארכיוניים.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. קטינים</h2>
              <p>
                השירותים שלנו מיועדים למשתמשים בגילאי 18 ומעלה. אנו לא אוספים במודע מידע
                מקטינים מתחת לגיל 18. אם גילית שקטין סיפק לנו מידע, אנא צור קשר ונמחק
                אותו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. קישורים לאתרים חיצוניים</h2>
              <p>
                האתר שלנו עשוי להכיל קישורים לאתרים חיצוניים (Bit, Google Maps וכו').
                איננו אחראים למדיניות הפרטיות או לתוכן של אתרים אלה. אנו ממליצים לקרוא את
                מדיניות הפרטיות שלהם.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. שינויים במדיניות</h2>
              <p>
                אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. נודיע לך על שינויים משמעותיים
                באמצעות דוא"ל או הודעה באתר. תאריך העדכון האחרון מופיע בתחתית המסמך.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. יצירת קשר</h2>
              <p>
                לשאלות, בקשות או תלונות בנוגע למדיניות הפרטיות או לטיפול במידע שלך, ניתן
                ליצור קשר:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-semibold mb-2">פרטי יצירת קשר:</p>
                <p>חברת לונסול</p>
                <p>
                  דוא"ל:{' '}
                  <a href="mailto:lironamy@gmail.com" className="text-primary hover:underline">
                    lironamy@gmail.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. תלונות</h2>
              <p>
                אם אינך מרוצה מהטיפול במידע האישי שלך, תוכל להגיש תלונה לרשות להגנת
                הפרטיות בישראל.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                תאריך עדכון אחרון: ינואר 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
