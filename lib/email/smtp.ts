import nodemailer from 'nodemailer';

// SMTP Configuration from environment variables
const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: smtpPort,
  // Port 465 = SSL (secure: true), Port 587 = STARTTLS (secure: false)
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  // Connection settings
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 60000,
  // TLS settings for STARTTLS (port 587)
  ...(smtpPort === 587 && {
    requireTLS: true,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2' as const,
    },
  }),
};

// Create transporter for each email (avoid stale connections)
function createTransporter() {
  return nodemailer.createTransport(SMTP_CONFIG);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

// Logo URL
const LOGO_URL = 'https://64.media.tumblr.com/31c16aacb75e390f1f2a295ea5d87602/0f61bf9fa2b6d79b-b2/s1280x1920/8e0edcc6f68a6d914e6590f4a91c525f2479990b.pnj';

// Confetti background pattern
const CONFETTI_BG = 'https://64.media.tumblr.com/dbd4caf896e45eb9b204bc903b9c836b/bf20f6d5425b00de-e9/s1280x1920/2432f6392bf1996b9e26fe5d08c821062926d197.pnj';

// Brand color (purple button)
const BRAND_COLOR = '#6d5efc';

/**
 * Send email using SMTP (Zoho Mail)
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  try {
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
      console.error('SMTP configuration is missing');
      throw new Error('SMTP configuration is missing. Please check your environment variables.');
    }

    const transport = createTransporter();

    const mailOptions = {
      from: `"לונסול" <${SMTP_CONFIG.auth.user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    };

    const result = await transport.sendMail(mailOptions);
    console.log(`[SMTP] Email sent to ${options.to}, messageId: ${result.messageId}`);

    return {
      success: true,
      message: 'האימייל נשלח בהצלחה',
    };
  } catch (error) {
    console.error('[SMTP] Error sending email:', error);
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
  const subject = '🔐 איפוס סיסמה - לונסול';

  const text = `
היי ${name},

קיבלנו בקשה לאיפוס הסיסמה שלך.

לחצו על הקישור הבא כדי לאפס את הסיסמה:
${resetLink}

⏰ הקישור תקף ל-24 שעות בלבד.

אם לא ביקשתם איפוס סיסמה, פשוט התעלמו מהודעה זו.

© לונסול • ניהול אירועים חכם במקום אחד
  `.trim();

  const html = `
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>איפוס סיסמה - לונסול</title>
  </head>
  <body style="margin:0; padding:0; direction:rtl; text-align:right;">
    <!-- Outer background (confetti) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl"
           bgcolor="#f6f7fb"
           style="direction:rtl; text-align:right; background-image:url('${CONFETTI_BG}'); background-repeat:repeat; background-size:420px auto;">
      <tr>
        <td align="center" style="padding:44px 16px; background:rgba(246,247,251,0.75);">

          <!-- Card -->
          <table width="620" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" dir="rtl"
                 style="direction:rtl; text-align:right; border-radius:24px; overflow:hidden; box-shadow: 0 8px 40px rgba(109,94,252,0.12);">

            <!-- Decorative Top Border -->
            <tr>
              <td style="background: linear-gradient(90deg, ${BRAND_COLOR} 0%, #a78bfa 50%, ${BRAND_COLOR} 100%); height:5px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 28px 28px 28px; background: linear-gradient(180deg, #faf8ff 0%, #ffffff 100%);">
                <img src="${LOGO_URL}"
                     width="150" alt="לונסול" border="0" style="display:block;">

                <div style="height:24px; line-height:24px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:32px; line-height:42px; color:${BRAND_COLOR}; font-weight:700;">
                  🔐 איפוס סיסמה
                </div>

                <div style="height:16px; line-height:16px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:18px; line-height:30px; color:#333333;">
                  היי <span style="color:${BRAND_COLOR}; font-weight:700;">${name}</span>,<br/>
                  קיבלנו בקשה לאיפוס הסיסמה שלך
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-bottom:2px dashed #e8e4f8;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:32px 36px;">
                <div style="font-family:Arial, sans-serif; font-size:16px; line-height:28px; color:#333333; text-align:center;">
                  לחצו על הכפתור הבא כדי לבחור סיסמה חדשה:
                </div>

                <div style="height:28px; line-height:28px;">&nbsp;</div>

                <!-- CTA Button -->
                <table align="center" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="${BRAND_COLOR}" style="border-radius:14px; box-shadow: 0 6px 20px rgba(109,94,252,0.35);">
                      <a href="${resetLink}"
                         style="display:inline-block; padding:16px 40px; font-family:Arial, sans-serif; font-size:18px; color:#ffffff; text-decoration:none; font-weight:700;">
                        איפוס סיסמה 🔓
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Warning Box -->
            <tr>
              <td style="padding:0 36px 28px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef3c7; border-radius:12px; border:2px dashed #fcd34d;">
                  <tr>
                    <td style="padding:18px 20px; text-align:center;">
                      <div style="font-family:Arial, sans-serif; font-size:14px; color:#333333;">
                        <span style="font-size:18px;">⏰</span>
                        <strong style="color:#b45309;">שימו לב:</strong>
                        הקישור תקף ל-<strong>24 שעות בלבד</strong>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Note -->
            <tr>
              <td style="padding:0 36px 28px 36px;">
                <div style="font-family:Arial, sans-serif; font-size:14px; line-height:24px; color:#666666; text-align:center;">
                  אם לא ביקשתם איפוס סיסמה, פשוט התעלמו מהודעה זו.<br/>
                  הסיסמה הנוכחית תישאר ללא שינוי.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px; background:#f6f7fb; border-top:1px solid #ececf5;">
                <div style="font-family:Arial, sans-serif; font-size:14px; line-height:24px; color:#666666; text-align:center;">
                  צריכים עזרה? אנחנו כאן! 💬<br/>
                  <a href="mailto:support@lunsoul.com" style="color:${BRAND_COLOR}; text-decoration:none; font-weight:700;">support@lunsoul.com</a>
                </div>
              </td>
            </tr>

          </table>

          <div style="height:24px; line-height:24px;">&nbsp;</div>

          <div style="font-family:Arial, sans-serif; font-size:12px; line-height:20px; color:#8a8a96; text-align:center;">
            © לונסול • ניהול אירועים חכם במקום אחד
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; message: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunsoul.com';
  const supportUrl = `${appUrl}/dashboard/help`;
  const subject = '🎉 ברוכים הבאים ללונסול!';

  const text = `
היי ${name}, איזה כיף שהצטרפת!
מעכשיו התכנון של האירוע שלך הולך להיות הרבה יותר פשוט ומסודר.

מה מחכה לכם בפנים:
• הזמנות דיגיטליות מרהיבות - מעל 25 עיצובים מקצועיים לבחירה
• שליחה אוטומטית בוואטסאפ - לוח זמנים חכם + 5 הודעות מוכנות
• אישורי הגעה בזמן אמת - כל הפרטים במקום אחד מסודר
• הושבה חכמה - גרור ושחרר עם הדמיה ויזואלית
• מעקב מתנות וסטטיסטיקות - דוחות וייצוא לאקסל בלחיצה

התחלה מהירה בשלושה צעדים:
1. בוחרים עיצוב להזמנה
2. מעלים או מוסיפים רשימת מוזמנים
3. שולחים בוואטסאפ ומקבלים אישורים בלייב!

התחילו עכשיו: ${appUrl}/dashboard

טיפ קטן: בחירת חבילת 200 אורחים מאפשרת להתחיל ללא עלות!

© לונסול • ניהול אירועים חכם במקום אחד
  `.trim();

  const html = `
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>ברוכים הבאים ללונסול</title>
  </head>
  <body style="margin:0; padding:0; direction:rtl; text-align:right;">
    <!-- Outer background (confetti) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl"
           bgcolor="#f6f7fb"
           style="direction:rtl; text-align:right; background-image:url('${CONFETTI_BG}'); background-repeat:repeat; background-size:420px auto;">
      <tr>
        <td align="center" style="padding:44px 16px; background:rgba(246,247,251,0.75);">

          <!-- Card -->
          <table width="620" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" dir="rtl"
                 style="direction:rtl; text-align:right; border-radius:24px; overflow:hidden; box-shadow: 0 8px 40px rgba(109,94,252,0.12);">

            <!-- Decorative Top Border -->
            <tr>
              <td style="background: linear-gradient(90deg, ${BRAND_COLOR} 0%, #a78bfa 50%, ${BRAND_COLOR} 100%); height:5px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 28px 28px 28px; background: linear-gradient(180deg, #faf8ff 0%, #ffffff 100%);">
                <img src="${LOGO_URL}"
                     width="150" alt="לונסול" border="0" style="display:block;">

                <div style="height:24px; line-height:24px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:32px; line-height:42px; color:${BRAND_COLOR}; font-weight:700;">
                  🎉 ברוכים הבאים! 🎉
                </div>

                <div style="height:16px; line-height:16px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:18px; line-height:30px; color:#333333;">
                  היי <span style="color:${BRAND_COLOR}; font-weight:700;">${name}</span>, איזה כיף שהצטרפת!<br/>
                  מעכשיו התכנון של האירוע שלך הולך להיות<br/>
                  <span style="color:${BRAND_COLOR}; font-weight:600;">הרבה יותר פשוט ומסודר</span>
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-bottom:2px dashed #e8e4f8;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Features Section -->
            <tr>
              <td style="padding:32px 36px 10px 36px;">

                <div style="font-family:Arial, sans-serif; font-size:20px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                  🎁 מה מחכה לכם בפנים?
                </div>

                <div style="height:20px; line-height:20px;">&nbsp;</div>

                <!-- Feature Cards -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">

                  <!-- Feature 1 -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:26px;">💌</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:600;">הזמנות דיגיטליות מרהיבות</div>
                                  <div style="font-family:Arial, sans-serif; font-size:13px; color:#777777;">מעל 25 עיצובים מקצועיים לבחירה</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Feature 2 -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:26px;">📱</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:600;">שליחה אוטומטית בוואטסאפ</div>
                                  <div style="font-family:Arial, sans-serif; font-size:13px; color:#777777;">לוח זמנים חכם + 5 הודעות מוכנות</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Feature 3 -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:26px;">✅</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:600;">אישורי הגעה בזמן אמת</div>
                                  <div style="font-family:Arial, sans-serif; font-size:13px; color:#777777;">כל הפרטים במקום אחד מסודר</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Feature 4 -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:26px;">🪑</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:600;">הושבה חכמה</div>
                                  <div style="font-family:Arial, sans-serif; font-size:13px; color:#777777;">גרור ושחרר עם הדמיה ויזואלית</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Feature 5 -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:26px;">📊</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:600;">מעקב מתנות וסטטיסטיקות</div>
                                  <div style="font-family:Arial, sans-serif; font-size:13px; color:#777777;">דוחות וייצוא לאקסל בלחיצה</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>

            <!-- Quick Start Section -->
            <tr>
              <td style="padding:24px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8f7ff" style="border-radius:16px;">
                  <tr>
                    <td style="padding:28px 24px;">

                      <div style="font-family:Arial, sans-serif; font-size:18px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                        🚀 התחלה מהירה בשלושה צעדים
                      </div>

                      <div style="height:20px; line-height:20px;">&nbsp;</div>

                      <!-- Steps -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <!-- Step 1 -->
                        <tr>
                          <td style="padding:10px 0;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td width="44" style="vertical-align:middle;">
                                  <div style="width:38px; height:38px; line-height:38px; text-align:center; background:${BRAND_COLOR}; color:#ffffff; font-family:Arial, sans-serif; font-size:18px; font-weight:700; border-radius:50%;">1</div>
                                </td>
                                <td style="vertical-align:middle; padding-right:12px;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:500;">בוחרים עיצוב להזמנה</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Step 2 -->
                        <tr>
                          <td style="padding:10px 0;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td width="44" style="vertical-align:middle;">
                                  <div style="width:38px; height:38px; line-height:38px; text-align:center; background:${BRAND_COLOR}; color:#ffffff; font-family:Arial, sans-serif; font-size:18px; font-weight:700; border-radius:50%;">2</div>
                                </td>
                                <td style="vertical-align:middle; padding-right:12px;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:500;">מעלים או מוסיפים רשימת מוזמנים</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Step 3 -->
                        <tr>
                          <td style="padding:10px 0;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td width="44" style="vertical-align:middle;">
                                  <div style="width:38px; height:38px; line-height:38px; text-align:center; background:${BRAND_COLOR}; color:#ffffff; font-family:Arial, sans-serif; font-size:18px; font-weight:700; border-radius:50%;">3</div>
                                </td>
                                <td style="vertical-align:middle; padding-right:12px;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:500;">שולחים בוואטסאפ ומקבלים אישורים בלייב!</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding:10px 36px 28px 36px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="${BRAND_COLOR}" style="border-radius:14px; box-shadow: 0 6px 20px rgba(109,94,252,0.35);">
                      <a href="${appUrl}/dashboard"
                         style="display:inline-block; padding:16px 40px; font-family:Arial, sans-serif; font-size:18px; color:#ffffff; text-decoration:none; font-weight:700;">
                        יאללה, מתחילים! ✨
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Tip Box -->
            <tr>
              <td style="padding:0 36px 28px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb; border-radius:12px; border:2px dashed #fcd34d;">
                  <tr>
                    <td style="padding:18px 20px; text-align:center;">
                      <div style="font-family:Arial, sans-serif; font-size:14px; color:#333333;">
                        <span style="font-size:18px;">💡</span>
                        <strong style="color:#b45309;">טיפ קטן:</strong>
                        בחירת חבילת 200 אורחים מאפשרת להתחיל <strong>ללא עלות!</strong>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px; background:#f6f7fb; border-top:1px solid #ececf5;">
                <div style="font-family:Arial, sans-serif; font-size:14px; line-height:24px; color:#666666; text-align:center;">
                  צריכים עזרה בהקמה או יש שאלה? אנחנו כאן! 💬<br/>
                  <a href="${supportUrl}" style="color:${BRAND_COLOR}; text-decoration:none; font-weight:700;">פנייה לתמיכה</a>
                </div>
              </td>
            </tr>

          </table>

          <div style="height:24px; line-height:24px;">&nbsp;</div>

          <div style="font-family:Arial, sans-serif; font-size:12px; line-height:20px; color:#8a8a96; text-align:center;">
            © לונסול • ניהול אירועים חכם במקום אחד
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
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
  const subject = `🎉 אישור הגעה לאירוע של ${weddingDetails.coupleName}`;

  const text = `
היי ${guestName}!

תודה רבה שאישרתם הגעה לאירוע שלנו! 🎊
אנחנו כל כך מתרגשים לראות אתכם!

פרטי האירוע:
📅 תאריך: ${weddingDetails.date}
📍 מקום: ${weddingDetails.venue}

מספר אורחים שאישרתם:
👥 מבוגרים: ${weddingDetails.adultsCount}
👶 ילדים: ${weddingDetails.childrenCount}

נתראה באירוע! ✨

בברכה ובאהבה,
${weddingDetails.coupleName}

© לונסול • ניהול אירועים חכם במקום אחד
  `.trim();

  const html = `
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>אישור הגעה - ${weddingDetails.coupleName}</title>
  </head>
  <body style="margin:0; padding:0; direction:rtl; text-align:right;">
    <!-- Outer background (confetti) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl"
           bgcolor="#f6f7fb"
           style="direction:rtl; text-align:right; background-image:url('${CONFETTI_BG}'); background-repeat:repeat; background-size:420px auto;">
      <tr>
        <td align="center" style="padding:44px 16px; background:rgba(246,247,251,0.75);">

          <!-- Card -->
          <table width="620" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" dir="rtl"
                 style="direction:rtl; text-align:right; border-radius:24px; overflow:hidden; box-shadow: 0 8px 40px rgba(109,94,252,0.12);">

            <!-- Decorative Top Border -->
            <tr>
              <td style="background: linear-gradient(90deg, ${BRAND_COLOR} 0%, #a78bfa 50%, ${BRAND_COLOR} 100%); height:5px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 28px 28px 28px; background: linear-gradient(180deg, #faf8ff 0%, #ffffff 100%);">
                <img src="${LOGO_URL}"
                     width="150" alt="לונסול" border="0" style="display:block;">

                <div style="height:24px; line-height:24px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:32px; line-height:42px; color:${BRAND_COLOR}; font-weight:700;">
                  🎉 תודה שאישרתם הגעה! 🎉
                </div>

                <div style="height:16px; line-height:16px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:18px; line-height:30px; color:#333333;">
                  היי <span style="color:${BRAND_COLOR}; font-weight:700;">${guestName}</span>!<br/>
                  אנחנו כל כך מתרגשים לראות אתכם באירוע! 💕
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-bottom:2px dashed #e8e4f8;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Event Details Section -->
            <tr>
              <td style="padding:32px 36px 10px 36px;">

                <div style="font-family:Arial, sans-serif; font-size:20px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                  📋 פרטי האירוע
                </div>

                <div style="height:20px; line-height:20px;">&nbsp;</div>

                <!-- Event Info Cards -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">

                  <!-- Date -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:26px;">📅</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:600;">תאריך</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:${BRAND_COLOR}; font-weight:700;">${weddingDetails.date}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Venue -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:26px;">📍</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; font-weight:600;">מקום</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:${BRAND_COLOR}; font-weight:700;">${weddingDetails.venue}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>

            <!-- Guest Count Section -->
            <tr>
              <td style="padding:24px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8f7ff" style="border-radius:16px;">
                  <tr>
                    <td style="padding:28px 24px;">

                      <div style="font-family:Arial, sans-serif; font-size:18px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                        👥 מספר אורחים שאישרתם
                      </div>

                      <div style="height:20px; line-height:20px;">&nbsp;</div>

                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="50%" style="text-align:center; padding:10px;">
                            <div style="width:60px; height:60px; line-height:60px; text-align:center; background:${BRAND_COLOR}; color:#ffffff; font-family:Arial, sans-serif; font-size:24px; font-weight:700; border-radius:50%; margin:0 auto;">${weddingDetails.adultsCount}</div>
                            <div style="font-family:Arial, sans-serif; font-size:14px; color:#666666; margin-top:10px;">👨‍👩‍👧‍👦 מבוגרים</div>
                          </td>
                          <td width="50%" style="text-align:center; padding:10px;">
                            <div style="width:60px; height:60px; line-height:60px; text-align:center; background:#a78bfa; color:#ffffff; font-family:Arial, sans-serif; font-size:24px; font-weight:700; border-radius:50%; margin:0 auto;">${weddingDetails.childrenCount}</div>
                            <div style="font-family:Arial, sans-serif; font-size:14px; color:#666666; margin-top:10px;">👶 ילדים</div>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- See You Message -->
            <tr>
              <td align="center" style="padding:10px 36px 28px 36px;">
                <div style="font-family:Arial, sans-serif; font-size:24px; line-height:36px; color:${BRAND_COLOR}; font-weight:700;">
                  ✨ נתראה באירוע! ✨
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px; background:#f6f7fb; border-top:1px solid #ececf5;">
                <div style="font-family:Arial, sans-serif; font-size:14px; line-height:24px; color:#666666; text-align:center;">
                  בברכה ובאהבה,<br/>
                  <span style="color:${BRAND_COLOR}; font-weight:700; font-size:18px;">${weddingDetails.coupleName}</span>
                </div>
                <div style="font-family:Arial, sans-serif; font-size:24px; text-align:center; margin-top:12px;">
                  💕 💒 💕
                </div>
              </td>
            </tr>

          </table>

          <div style="height:24px; line-height:24px;">&nbsp;</div>

          <div style="font-family:Arial, sans-serif; font-size:12px; line-height:20px; color:#8a8a96; text-align:center;">
            © לונסול • ניהול אירועים חכם במקום אחד
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send support/contact email
 */
export async function sendSupportEmail(
  fromEmail: string,
  fromName: string,
  subject: string,
  message: string,
  weddingInfo?: string
): Promise<{ success: boolean; message: string }> {
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@lunsoul.com';
  const emailSubject = `📬 [תמיכה] ${subject} - ${fromName}`;

  const text = `
פנייה חדשה מהמערכת

פרטי הפונה:
━━━━━━━━━━━━━━━━━━━━━━━━
👤 מאת: ${fromName} (${fromEmail})
${weddingInfo ? `💒 אירוע: ${weddingInfo}` : ''}
📝 נושא: ${subject}

💬 הודעה:
━━━━━━━━━━━━━━━━━━━━━━━━
${message}

━━━━━━━━━━━━━━━━━━━━━━━━
נשלח מדף העזרה בדשבורד
© לונסול
  `.trim();

  const html = `
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>פנייה חדשה - תמיכה</title>
  </head>
  <body style="margin:0; padding:0; direction:rtl; text-align:right;">
    <!-- Outer background (confetti) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl"
           bgcolor="#f6f7fb"
           style="direction:rtl; text-align:right; background-image:url('${CONFETTI_BG}'); background-repeat:repeat; background-size:420px auto;">
      <tr>
        <td align="center" style="padding:44px 16px; background:rgba(246,247,251,0.75);">

          <!-- Card -->
          <table width="620" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" dir="rtl"
                 style="direction:rtl; text-align:right; border-radius:24px; overflow:hidden; box-shadow: 0 8px 40px rgba(109,94,252,0.12);">

            <!-- Decorative Top Border -->
            <tr>
              <td style="background: linear-gradient(90deg, ${BRAND_COLOR} 0%, #a78bfa 50%, ${BRAND_COLOR} 100%); height:5px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 28px 28px 28px; background: linear-gradient(180deg, #faf8ff 0%, #ffffff 100%);">
                <img src="${LOGO_URL}"
                     width="120" alt="לונסול" border="0" style="display:block;">

                <div style="height:24px; line-height:24px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:28px; line-height:38px; color:${BRAND_COLOR}; font-weight:700;">
                  📬 פנייה חדשה מהמערכת
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-bottom:2px dashed #e8e4f8;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Sender Info Section -->
            <tr>
              <td style="padding:32px 36px 10px 36px;">

                <div style="font-family:Arial, sans-serif; font-size:18px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                  👤 פרטי הפונה
                </div>

                <div style="height:16px; line-height:16px;">&nbsp;</div>

                <!-- Info Cards -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">

                  <!-- From -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:22px;">👤</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:14px; color:#777777;">שם</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:#333333; font-weight:600;">${fromName}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Email -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:22px;">📧</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:14px; color:#777777;">אימייל</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:${BRAND_COLOR}; font-weight:600;">${fromEmail}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  ${weddingInfo ? `
                  <!-- Wedding Info -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:22px;">💒</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:14px; color:#777777;">אירוע</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:#333333; font-weight:600;">${weddingInfo}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ` : ''}

                  <!-- Subject -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:14px; font-size:22px;">📝</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:14px; color:#777777;">נושא</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:#333333; font-weight:600;">${subject}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>

            <!-- Message Section -->
            <tr>
              <td style="padding:24px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8f7ff" style="border-radius:16px;">
                  <tr>
                    <td style="padding:24px;">

                      <div style="font-family:Arial, sans-serif; font-size:18px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                        💬 הודעה
                      </div>

                      <div style="height:16px; line-height:16px;">&nbsp;</div>

                      <div style="font-family:Arial, sans-serif; font-size:15px; line-height:26px; color:#333333; background:#ffffff; padding:20px; border-radius:12px; border:1px dashed #e8e4f8; white-space:pre-wrap;">${message}</div>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px; background:#f6f7fb; border-top:1px solid #ececf5;">
                <div style="font-family:Arial, sans-serif; font-size:13px; line-height:22px; color:#666666; text-align:center;">
                  נשלח מדף העזרה בדשבורד
                </div>
              </td>
            </tr>

          </table>

          <div style="height:24px; line-height:24px;">&nbsp;</div>

          <div style="font-family:Arial, sans-serif; font-size:12px; line-height:20px; color:#8a8a96; text-align:center;">
            © לונסול • ניהול אירועים חכם במקום אחד
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({
    to: supportEmail,
    subject: emailSubject,
    text,
    html,
    replyTo: fromEmail,
  });
}

/**
 * Send refund request email to admin
 */
export async function sendRefundRequestEmail(params: {
  fullName: string;
  email: string;
  phone: string;
  weddingId: string;
  currentPackage: number;
  requestedPackage: number;
  paidAmount: number;
  refundAmount: number;
  reason?: string;
}): Promise<{ success: boolean; message: string }> {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'agathario91@gmail.com';
  const subject = `💰 בקשת החזר כספי - ${params.fullName} - ₪${params.refundAmount}`;

  const text = `
בקשת החזר כספי חדשה

💰 סכום החזר: ₪${params.refundAmount}

פרטי המבקש:
━━━━━━━━━━━━━━━━━━━━━━━━
👤 שם מלא: ${params.fullName}
📧 אימייל: ${params.email}
📱 טלפון נייד: ${params.phone}

פרטי התשלום:
━━━━━━━━━━━━━━━━━━━━━━━━
🆔 מזהה חתונה: ${params.weddingId}
📦 חבילה נוכחית: ${params.currentPackage} מוזמנים
📦 חבילה מבוקשת: ${params.requestedPackage} מוזמנים
💵 סכום ששולם: ₪${params.paidAmount}
💰 סכום החזר מבוקש: ₪${params.refundAmount}

סיבת הבקשה:
━━━━━━━━━━━━━━━━━━━━━━━━
${params.reason || 'לא צוינה סיבה'}

אופן ההחזר:
━━━━━━━━━━━━━━━━━━━━━━━━
💳 זיכוי לכרטיס האשראי שאיתו בוצע התשלום (עד 14 ימי עסקים)

© לונסול
  `.trim();

  const html = `
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>בקשת החזר כספי</title>
  </head>
  <body style="margin:0; padding:0; direction:rtl; text-align:right;">
    <!-- Outer background (confetti) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl"
           bgcolor="#f6f7fb"
           style="direction:rtl; text-align:right; background-image:url('${CONFETTI_BG}'); background-repeat:repeat; background-size:420px auto;">
      <tr>
        <td align="center" style="padding:44px 16px; background:rgba(246,247,251,0.75);">

          <!-- Card -->
          <table width="620" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" dir="rtl"
                 style="direction:rtl; text-align:right; border-radius:24px; overflow:hidden; box-shadow: 0 8px 40px rgba(109,94,252,0.12);">

            <!-- Decorative Top Border -->
            <tr>
              <td style="background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%); height:5px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 28px 20px 28px; background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);">
                <img src="${LOGO_URL}"
                     width="120" alt="לונסול" border="0" style="display:block;">

                <div style="height:24px; line-height:24px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:28px; line-height:38px; color:#d97706; font-weight:700;">
                  💰 בקשת החזר כספי
                </div>
              </td>
            </tr>

            <!-- Amount Display -->
            <tr>
              <td align="center" style="padding:10px 28px 28px 28px;">
                <div style="width:120px; height:120px; line-height:120px; text-align:center; background:linear-gradient(135deg, #f59e0b, #fbbf24); color:#ffffff; font-family:Arial, sans-serif; font-size:32px; font-weight:700; border-radius:50%; margin:0 auto; box-shadow: 0 8px 25px rgba(245,158,11,0.35);">
                  ₪${params.refundAmount}
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-bottom:2px dashed #fcd34d;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Requester Info Section -->
            <tr>
              <td style="padding:32px 36px 10px 36px;">

                <div style="font-family:Arial, sans-serif; font-size:18px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                  👤 פרטי המבקש
                </div>

                <div style="height:16px; line-height:16px;">&nbsp;</div>

                <!-- Info Cards -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">

                  <!-- Name -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fffbeb" style="border-radius:14px; border:1px solid #fde68a;">
                        <tr>
                          <td style="padding:14px 18px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:12px; font-size:20px;">👤</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:13px; color:#92400e;">שם מלא</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:#333333; font-weight:600;">${params.fullName}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Email -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fffbeb" style="border-radius:14px; border:1px solid #fde68a;">
                        <tr>
                          <td style="padding:14px 18px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:12px; font-size:20px;">📧</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:13px; color:#92400e;">אימייל</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:#d97706; font-weight:600;">${params.email}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Phone -->
                  <tr>
                    <td style="padding:8px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fffbeb" style="border-radius:14px; border:1px solid #fde68a;">
                        <tr>
                          <td style="padding:14px 18px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="vertical-align:middle; padding-left:12px; font-size:20px;">📱</td>
                                <td style="vertical-align:middle;">
                                  <div style="font-family:Arial, sans-serif; font-size:13px; color:#92400e;">טלפון</div>
                                  <div style="font-family:Arial, sans-serif; font-size:16px; color:#333333; font-weight:600;">${params.phone}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>

            <!-- Payment Details Section -->
            <tr>
              <td style="padding:24px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fef3c7" style="border-radius:16px;">
                  <tr>
                    <td style="padding:24px;">

                      <div style="font-family:Arial, sans-serif; font-size:18px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                        💳 פרטי התשלום
                      </div>

                      <div style="height:16px; line-height:16px;">&nbsp;</div>

                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#92400e;">🆔 מזהה חתונה:</td>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#333333; font-weight:600; text-align:left;">${params.weddingId}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#92400e;">📦 חבילה נוכחית:</td>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#333333; font-weight:600; text-align:left;">${params.currentPackage} מוזמנים</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#92400e;">📦 חבילה מבוקשת:</td>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#333333; font-weight:600; text-align:left;">${params.requestedPackage} מוזמנים</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#92400e;">💵 סכום ששולם:</td>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#333333; font-weight:600; text-align:left;">₪${params.paidAmount}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:14px; color:#92400e;">💰 סכום החזר:</td>
                          <td style="padding:8px 0; font-family:Arial, sans-serif; font-size:18px; color:#d97706; font-weight:700; text-align:left;">₪${params.refundAmount}</td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Reason Section -->
            <tr>
              <td style="padding:0 36px 24px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8f7ff" style="border-radius:16px;">
                  <tr>
                    <td style="padding:24px;">

                      <div style="font-family:Arial, sans-serif; font-size:18px; line-height:28px; color:#111111; font-weight:700; text-align:center;">
                        📝 סיבת הבקשה
                      </div>

                      <div style="height:16px; line-height:16px;">&nbsp;</div>

                      <div style="font-family:Arial, sans-serif; font-size:15px; line-height:26px; color:#333333; background:#ffffff; padding:16px; border-radius:12px; border:1px dashed #e8e4f8;">${params.reason || 'לא צוינה סיבה'}</div>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Refund Method Note -->
            <tr>
              <td style="padding:0 36px 28px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb; border-radius:12px; border:2px dashed #fcd34d;">
                  <tr>
                    <td style="padding:18px 20px; text-align:center;">
                      <div style="font-family:Arial, sans-serif; font-size:14px; color:#333333;">
                        <span style="font-size:18px;">💳</span>
                        <strong style="color:#b45309;">אופן ההחזר:</strong>
                        זיכוי לכרטיס האשראי שאיתו בוצע התשלום (עד 14 ימי עסקים)
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px; background:#f6f7fb; border-top:1px solid #ececf5;">
                <div style="font-family:Arial, sans-serif; font-size:13px; line-height:22px; color:#666666; text-align:center;">
                  בקשה זו נשלחה מהמערכת
                </div>
              </td>
            </tr>

          </table>

          <div style="height:24px; line-height:24px;">&nbsp;</div>

          <div style="font-family:Arial, sans-serif; font-size:12px; line-height:20px; color:#8a8a96; text-align:center;">
            © לונסול • ניהול אירועים חכם במקום אחד
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({
    to: adminEmail,
    subject,
    text,
    html,
    replyTo: params.email,
  });
}

/**
 * Send refund request confirmation to customer
 */
export async function sendRefundConfirmationToCustomer(params: {
  fullName: string;
  email: string;
  refundAmount: number;
}): Promise<{ success: boolean; message: string }> {
  const subject = '✅ קיבלנו את בקשת הזיכוי שלך - לונסול';

  const text = `
היי ${params.fullName},

קיבלנו את בקשת הזיכוי שלך על סך ₪${params.refundAmount}.

הזיכוי יבוצע לכרטיס האשראי שממנו בוצע התשלום תוך 14 ימי עסקים.

תודה רבה!
צוות לונסול

© לונסול • ניהול אירועים חכם במקום אחד
  `.trim();

  const html = `
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>אישור בקשת זיכוי - לונסול</title>
  </head>
  <body style="margin:0; padding:0; direction:rtl; text-align:right;">
    <!-- Outer background (confetti) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl"
           bgcolor="#f6f7fb"
           style="direction:rtl; text-align:right; background-image:url('${CONFETTI_BG}'); background-repeat:repeat; background-size:420px auto;">
      <tr>
        <td align="center" style="padding:44px 16px; background:rgba(246,247,251,0.75);">

          <!-- Card -->
          <table width="620" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" dir="rtl"
                 style="direction:rtl; text-align:right; border-radius:24px; overflow:hidden; box-shadow: 0 8px 40px rgba(109,94,252,0.12);">

            <!-- Decorative Top Border -->
            <tr>
              <td style="background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%); height:5px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 28px 28px 28px; background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%);">
                <img src="${LOGO_URL}"
                     width="150" alt="לונסול" border="0" style="display:block;">

                <div style="height:24px; line-height:24px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:32px; line-height:42px; color:#10b981; font-weight:700;">
                  ✅ קיבלנו את הבקשה!
                </div>

                <div style="height:16px; line-height:16px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:18px; line-height:30px; color:#333333;">
                  היי <span style="color:#10b981; font-weight:700;">${params.fullName}</span>,<br/>
                  קיבלנו את בקשת הזיכוי שלך
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-bottom:2px dashed #a7f3d0;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Amount Display -->
            <tr>
              <td align="center" style="padding:32px 28px;">
                <div style="font-family:Arial, sans-serif; font-size:18px; color:#333333; margin-bottom:16px;">
                  סכום הזיכוי:
                </div>
                <div style="width:140px; height:140px; line-height:140px; text-align:center; background:linear-gradient(135deg, #10b981, #34d399); color:#ffffff; font-family:Arial, sans-serif; font-size:36px; font-weight:700; border-radius:50%; margin:0 auto; box-shadow: 0 8px 25px rgba(16,185,129,0.35);">
                  ₪${params.refundAmount}
                </div>
              </td>
            </tr>

            <!-- Info Box -->
            <tr>
              <td style="padding:0 36px 28px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ecfdf5; border-radius:12px; border:2px dashed #34d399;">
                  <tr>
                    <td style="padding:18px 20px; text-align:center;">
                      <div style="font-family:Arial, sans-serif; font-size:15px; color:#333333; line-height:26px;">
                        <span style="font-size:20px;">💳</span><br/>
                        הזיכוי יבוצע לכרטיס האשראי שממנו בוצע התשלום<br/>
                        <strong style="color:#059669;">תוך 14 ימי עסקים</strong>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Thank You -->
            <tr>
              <td align="center" style="padding:0 36px 28px 36px;">
                <div style="font-family:Arial, sans-serif; font-size:20px; line-height:32px; color:#10b981; font-weight:700;">
                  תודה רבה! 🙏
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px; background:#f6f7fb; border-top:1px solid #ececf5;">
                <div style="font-family:Arial, sans-serif; font-size:14px; line-height:24px; color:#666666; text-align:center;">
                  יש שאלות? אנחנו כאן! 💬<br/>
                  <a href="mailto:support@lunsoul.com" style="color:${BRAND_COLOR}; text-decoration:none; font-weight:700;">support@lunsoul.com</a>
                </div>
              </td>
            </tr>

          </table>

          <div style="height:24px; line-height:24px;">&nbsp;</div>

          <div style="font-family:Arial, sans-serif; font-size:12px; line-height:20px; color:#8a8a96; text-align:center;">
            © לונסול • ניהול אירועים חכם במקום אחד
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({ to: params.email, subject, text, html });
}

/**
 * Send support request confirmation to customer
 */
export async function sendSupportConfirmationToCustomer(params: {
  name: string;
  email: string;
  subject: string;
}): Promise<{ success: boolean; message: string }> {
  const emailSubject = '✅ קיבלנו את הפנייה שלך - לונסול';

  const text = `
היי ${params.name},

קיבלנו את הפנייה שלך בנושא: "${params.subject}"

נחזור אליך עד יום העסקים הבא.

תודה רבה!
צוות לונסול

© לונסול • ניהול אירועים חכם במקום אחד
  `.trim();

  const html = `
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>אישור פנייה לתמיכה - לונסול</title>
  </head>
  <body style="margin:0; padding:0; direction:rtl; text-align:right;">
    <!-- Outer background (confetti) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl"
           bgcolor="#f6f7fb"
           style="direction:rtl; text-align:right; background-image:url('${CONFETTI_BG}'); background-repeat:repeat; background-size:420px auto;">
      <tr>
        <td align="center" style="padding:44px 16px; background:rgba(246,247,251,0.75);">

          <!-- Card -->
          <table width="620" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" dir="rtl"
                 style="direction:rtl; text-align:right; border-radius:24px; overflow:hidden; box-shadow: 0 8px 40px rgba(109,94,252,0.12);">

            <!-- Decorative Top Border -->
            <tr>
              <td style="background: linear-gradient(90deg, ${BRAND_COLOR} 0%, #a78bfa 50%, ${BRAND_COLOR} 100%); height:5px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 28px 28px 28px; background: linear-gradient(180deg, #faf8ff 0%, #ffffff 100%);">
                <img src="${LOGO_URL}"
                     width="150" alt="לונסול" border="0" style="display:block;">

                <div style="height:24px; line-height:24px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:32px; line-height:42px; color:${BRAND_COLOR}; font-weight:700;">
                  ✅ קיבלנו את הפנייה!
                </div>

                <div style="height:16px; line-height:16px;">&nbsp;</div>

                <div style="font-family:Arial, sans-serif; font-size:18px; line-height:30px; color:#333333;">
                  היי <span style="color:${BRAND_COLOR}; font-weight:700;">${params.name}</span>,<br/>
                  תודה שפנית אלינו!
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-bottom:2px dashed #e8e4f8;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Subject Display -->
            <tr>
              <td style="padding:32px 36px 10px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf8ff" style="border-radius:14px; border:1px solid #f0ecff;">
                  <tr>
                    <td style="padding:20px;">
                      <div style="font-family:Arial, sans-serif; font-size:14px; color:#777777; margin-bottom:8px;">
                        📝 נושא הפנייה:
                      </div>
                      <div style="font-family:Arial, sans-serif; font-size:18px; color:#333333; font-weight:600;">
                        ${params.subject}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Response Time Box -->
            <tr>
              <td style="padding:24px 36px 28px 36px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb; border-radius:12px; border:2px dashed #fcd34d;">
                  <tr>
                    <td style="padding:24px 20px; text-align:center;">
                      <div style="font-family:Arial, sans-serif; font-size:16px; color:#333333; line-height:28px;">
                        <span style="font-size:28px;">⏰</span><br/>
                        <strong style="color:#b45309;">נחזור אליך עד יום העסקים הבא</strong>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Thank You -->
            <tr>
              <td align="center" style="padding:0 36px 28px 36px;">
                <div style="font-family:Arial, sans-serif; font-size:20px; line-height:32px; color:${BRAND_COLOR}; font-weight:700;">
                  תודה רבה על הסבלנות! 🙏
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px; background:#f6f7fb; border-top:1px solid #ececf5;">
                <div style="font-family:Arial, sans-serif; font-size:14px; line-height:24px; color:#666666; text-align:center;">
                  בינתיים, אתם מוזמנים לבדוק את<br/>
                  <a href="https://lunsoul.com/dashboard/help" style="color:${BRAND_COLOR}; text-decoration:none; font-weight:700;">מרכז העזרה שלנו</a>
                </div>
              </td>
            </tr>

          </table>

          <div style="height:24px; line-height:24px;">&nbsp;</div>

          <div style="font-family:Arial, sans-serif; font-size:12px; line-height:20px; color:#8a8a96; text-align:center;">
            © לונסול • ניהול אירועים חכם במקום אחד
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return sendEmail({ to: params.email, subject: emailSubject, text, html });
}
