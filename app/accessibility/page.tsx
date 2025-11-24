import Link from 'next/link';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-primary/80 mb-8"
        >
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          חזרה לדף הבית
        </Link>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">הצהרת נגישות</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">מחויבות לנגישות</h2>
              <p>
                לונסול מחויבת להנגיש את שירותיה לכלל האוכלוסייה, לרבות אנשים עם מוגבלות,
                מתוך אמונה בשוויון הזכויות והזדמנויות לכולם. אנו פועלים להנגשת האתר בהתאם
                לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013
                ובהתאם להוראות התקן הישראלי (ת"י 5568).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">נגישות האתר</h2>
              <p>האתר הונגש על פי המלצות התקן הישראלי (ת"י 5568) ברמת AA, הכולל:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>שימוש בכותרות, רשימות וסימון סמנטי נכון של האתר</li>
                <li>אפשרות ניווט באמצעות מקלדת בלבד</li>
                <li>תמיכה בתוכנות הקראת מסך (Screen Readers)</li>
                <li>ניגודיות צבעים מספקת לקריאה נוחה</li>
                <li>גופנים ברורים ותמיכה בהגדלה עד 200%</li>
                <li>טקסטים חלופיים (Alt Text) לתמונות</li>
                <li>סימון ברור של קישורים ושדות טפסים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">תאימות לדפדפנים ומכשירים</h2>
              <p>האתר תואם לעבודה עם:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>הדפדפנים העדכניים: Chrome, Firefox, Safari, Edge</li>
                <li>מחשבים אישיים, טאבלטים וטלפונים חכמים</li>
                <li>מערכות הפעלה: Windows, Mac, iOS, Android</li>
                <li>תוכנות הקראת מסך: NVDA, JAWS, VoiceOver</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">תהליך ההנגשה</h2>
              <p>
                האתר עבר תהליך הנגשה מקיף הכולל בדיקה אוטומטית וידנית על ידי מומחי נגישות.
                אנו ממשיכים לעבוד באופן שוטף על שיפור והרחבת הנגישות באתר.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">הגבלות נגישות ידועות</h2>
              <p>למרות מאמצינו, ייתכן שחלקים מסוימים באתר טרם הונגשו במלואם:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>תכנים שהועלו על ידי משתמשים (תמונות ללא טקסט חלופי)</li>
                <li>תכנים חיצוניים משירותי צד שלישי (Bit, WhatsApp)</li>
                <li>חלקים מסוימים בתהליך פיתוח מתמשך</li>
              </ul>
              <p className="mt-4">
                אנו פועלים לשיפור מתמיד ומזמינים אתכם ליידע אותנו על כל בעיה או חסם נגישות
                שנתקלתם בו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">רכז נגישות</h2>
              <p>
                מונה רכז נגישות אשר תפקידו לטפל בפניות בנושא נגישות האתר ולפעול לשיפור
                מתמיד של הנגישות.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-semibold mb-2">פרטי רכז הנגישות:</p>
                <p>שם: צוות לונסול</p>
                <p>
                  דוא"ל:{' '}
                  <a href="mailto:lironamy@gmail.com" className="text-primary hover:underline">
                    lironamy@gmail.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">משוב ופניות</h2>
              <p>
                אם נתקלת בבעיית נגישות באתר או שיש לך הצעות לשיפור, נשמח לשמוע ממך.
                נעשה כל שביכולתנו לטפל בפנייתך בהקדם האפשרי.
              </p>
              <p className="mt-4">
                ניתן ליצור קשר בדוא"ל:{' '}
                <a href="mailto:lironamy@gmail.com" className="text-primary hover:underline">
                  lironamy@gmail.com
                </a>
              </p>
              <p className="mt-2">
                אנו מתחייבים לחזור אליך תוך 5 ימי עסקים ולעשות כל שביכולתנו לפתור את
                הבעיה.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">הסדרי נגישות פיזיים</h2>
              <p>
                לונסול היא פלטפורמה דיגיטלית ללא משרדים פיזיים המשרתים קהל. כל השירותים
                ניתנים באופן מקוון דרך האתר.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                תאריך עדכון אחרון של הצהרה זו: ינואר 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
