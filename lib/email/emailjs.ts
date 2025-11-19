import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';

// Initialize EmailJS
if (typeof window !== 'undefined' && EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  [key: string]: string;
}

/**
 * Send email using EmailJS
 */
export async function sendEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error('EmailJS configuration is missing. Please check your environment variables.');
    }

    // Ensure proper UTF-8 encoding for the message
    const encodedParams = {
      ...params,
      message: Buffer.from(params.message, 'utf8').toString('utf8')
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      encodedParams
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'האימייל נשלח בהצלחה',
      };
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('EmailJS Error:', error);
    return {
      success: false,
      message: 'אירעה שגיאה בשליחת האימייל',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<{ success: boolean; message: string }> {
  const params: EmailParams = {
    to_email: email,
    to_name: name,
    subject: 'איפוס סיסמה - פלטפורמת חתונות',
    message: `
שלום ${name},

קיבלנו בקשה לאיפוס הסיסמה שלך.

לחץ על הקישור הבא כדי לאפס את הסיסמה:
${resetLink}

הקישור תקף ל-24 שעות.

אם לא ביקשת איפוס סיסמה, התעלם מהודעה זו.

בברכה,
צוות פלטפורמת חתונות
    `.trim(),
  };

  return sendEmail(params);
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; message: string }> {
  const params: EmailParams = {
    to_email: email,
    to_name: name,
    subject: 'ברוכים הבאים לפלטפורמת חתונות!',
    message: `
שלום ${name},

ברוכים הבאים לפלטפורמת החתונות שלנו! 🎉

אנחנו שמחים שבחרת להשתמש בפלטפורמה שלנו לניהול החתונה המיוחדת שלך.

כעת תוכל:
✅ ליצור הזמנות דיגיטליות מעוצבות
✅ לנהל את רשימת האורחים שלך
✅ לשלוח הזמנות ותזכורות דרך WhatsApp
✅ לעקוב אחר אישורי הגעה
✅ לנהל סידורי ישיבה
✅ לעקוב אחר מתנות

התחל עכשיו: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

בהצלחה בהכנות לחתונה!
צוות פלטפורמת חתונות
    `.trim(),
  };

  return sendEmail(params);
}

/**
 * Send RSVP confirmation email
 */
export async function sendRSVPConfirmationEmail(
  email: string,
  guestName: string,
  weddingDetails: {
    coupleName: string;
    date: string;
    venue: string;
    adultsCount: number;
    childrenCount: number;
  }
): Promise<{ success: boolean; message: string }> {
  const params: EmailParams = {
    to_email: email,
    to_name: guestName,
    subject: `אישור הגעה לחתונת ${weddingDetails.coupleName}`,
    message: `
שלום ${guestName},

תודה שאישרת הגעה לחתונה שלנו! 🎊

פרטי האירוע:
📅 תאריך: ${weddingDetails.date}
📍 מקום: ${weddingDetails.venue}

מספר אורחים שאישרת:
👨‍👩‍👧‍👦 מבוגרים: ${weddingDetails.adultsCount}
👶 ילדים: ${weddingDetails.childrenCount}

נתראה באירוע!

בברכה,
${weddingDetails.coupleName}
    `.trim(),
  };

  return sendEmail(params);
}
