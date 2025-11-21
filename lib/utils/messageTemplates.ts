/**
 * Message template system for wedding invitations and reminders
 * All templates are in Hebrew with RTL support
 */

import { replaceGenderPlaceholders, type PartnerType } from './genderText';

/**
 * Emoji generator function - creates emojis at runtime to avoid encoding issues
 */
function e(codePoint: number): string {
  return String.fromCodePoint(codePoint);
}

// Emojis created dynamically at runtime
const emoji = {
  ring: e(0x1F48D),           // 💍
  wave: e(0x1F44B),           // 👋
  bride: e(0x1F470),          // 👰
  groom: e(0x1F935),          // 🤵
  calendar: e(0x1F4C5),       // 📅
  clock: e(0x1F550),          // 🕐
  twoHearts: e(0x1F495),      // 💕
  wedding: e(0x1F492),        // 💒
  pin: e(0x1F4CD),            // 📍
  pray: e(0x1F64F),           // 🙏
  party: e(0x1F389),          // 🎉
  chair: e(0x1FA91),          // 🪑
  heart: e(0x2764) + e(0xFE0F), // ❤️ (heart + variation selector)
  sparkles: e(0x2728),        // ✨
  confetti: e(0x1F38A),       // 🎊
};

export type MessageType = 'invitation' | 'rsvp_reminder' | 'rsvp_reminder_2' | 'day_before' | 'thank_you';

export interface MessageTemplate {
  type: MessageType;
  title: string;
  description: string;
  template: string;
  variables: string[];
}

export interface MessageVariables {
  guestName: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  rsvpLink: string;
  tableNumber?: number;
  appUrl: string;
  giftLink?: string;
  partner1Type?: PartnerType;
  partner2Type?: PartnerType;
}

/**
 * Message templates collection
 */
export const MESSAGE_TEMPLATES: Record<MessageType, MessageTemplate> = {
  invitation: {
    type: 'invitation',
    title: 'הזמנה ראשונית',
    description: 'הודעת הזמנה ראשונית לחתונה',
    template: `היי {guestName}, {gender:happy} ו{gender:excited}
להזמינכם לחתונה שלנו ${emoji.ring}

נפגש ביום {eventDate}
ב"{venue}" בשעה {eventTime}

{gender:excited} לחגוג איתכם,
{groomName} ו{brideName}

לחצו על הקישור לאישור הגעה
{rsvpLink}{giftSection}`,
    variables: ['guestName', 'groomName', 'brideName', 'eventDate', 'eventTime', 'venue', 'rsvpLink', 'giftLink'],
  },

  rsvp_reminder: {
    type: 'rsvp_reminder',
    title: 'תזכורת ראשונה - אישור הגעה',
    description: 'תזכורת ראשונה לאורחים שטרם אישרו הגעה',
    template: `היי {guestName}! ${emoji.wave}

עדיין לא קיבלנו אישור הגעה ממך לחתונה שלנו.

${emoji.bride}${emoji.groom} {groomName} & {brideName}
${emoji.calendar} {eventDate} | ${emoji.clock} {eventTime}

נשמח מאוד אם תוכלו לאשר הגעה כאן:
{rsvpLink}

תודה רבה! ${emoji.twoHearts}`,
    variables: ['guestName', 'groomName', 'brideName', 'eventDate', 'eventTime', 'rsvpLink'],
  },

  rsvp_reminder_2: {
    type: 'rsvp_reminder_2',
    title: 'תזכורת שנייה - אישור הגעה',
    description: 'תזכורת אחרונה לאורחים שטרם אישרו הגעה',
    template: `שלום {guestName},

זו תזכורת אחרונה לאישור הגעה לחתונה שלנו ${emoji.wedding}

החתונה מתקרבת והיינו {gender:wanting} לדעת אם תוכלו להגיע.

${emoji.calendar} {eventDate} | ${emoji.clock} {eventTime}
${emoji.pin} {venue}

לאישור הגעה (לוקח רק דקה):
{rsvpLink}

{gender:waiting} לתשובה! ${emoji.pray}`,
    variables: ['guestName', 'eventDate', 'eventTime', 'venue', 'rsvpLink'],
  },

  day_before: {
    type: 'day_before',
    title: 'תזכורת יום לפני',
    description: 'תזכורת יום לפני האירוע כולל מספר שולחן',
    template: `היי {guestName}! ${emoji.party}

מחר {gender:gettingMarried}! ${emoji.wedding}
{gender:waiting} לראות אתכם באירוע.

${emoji.pin} מיקום: {venue}
${emoji.clock} שעה: {eventTime}
${emoji.chair} מספר שולחן: {tableNumber}

להגעה לאולם:
{appUrl}/wedding/directions

נתראה מחר! ${emoji.heart}${emoji.sparkles}`,
    variables: ['guestName', 'venue', 'eventTime', 'tableNumber', 'appUrl'],
  },

  thank_you: {
    type: 'thank_you',
    title: 'תודה',
    description: 'הודעת תודה לאחר האירוע',
    template: `שלום {guestName}! ${emoji.twoHearts}

תודה ענקית שהייתם חלק מהיום המיוחד שלנו! ${emoji.confetti}

הנוכחות שלכם הפכה את החתונה למושלמת ואנחנו {gender:grateful} תודה על שחגגתם איתנו.

{gender:hoping} שנהניתם והיה לכם כיף!

באהבה,
{groomName} & {brideName} ${emoji.heart}`,
    variables: ['guestName', 'groomName', 'brideName'],
  },
};

/**
 * Generate message content from template
 */
export function generateMessage(
  type: MessageType,
  variables: MessageVariables
): string {
  const template = MESSAGE_TEMPLATES[type];
  let message = template.template;

  console.log('🔍 [SERVER] Template before replacement:', template.template.substring(0, 100));
  console.log('🔍 [SERVER] Template bytes:', Buffer.from(template.template.substring(0, 50)).toString('hex'));

  // Replace gender placeholders first
  const partner1Type = variables.partner1Type || 'groom';
  const partner2Type = variables.partner2Type || 'bride';
  message = replaceGenderPlaceholders(message, partner1Type, partner2Type);

  // Replace all variables in the template
  message = message.replace(/{guestName}/g, variables.guestName);
  message = message.replace(/{groomName}/g, variables.groomName);
  message = message.replace(/{brideName}/g, variables.brideName);
  message = message.replace(/{eventDate}/g, variables.eventDate);
  message = message.replace(/{eventTime}/g, variables.eventTime);
  message = message.replace(/{venue}/g, variables.venue);
  message = message.replace(/{rsvpLink}/g, variables.rsvpLink);
  message = message.replace(/{tableNumber}/g, variables.tableNumber?.toString() || 'לא הוקצה');
  message = message.replace(/{appUrl}/g, variables.appUrl);

  return message;
}

/**
 * Get template by type
 */
export function getTemplate(type: MessageType): MessageTemplate {
  return MESSAGE_TEMPLATES[type];
}

/**
 * Get all template types
 */
export function getAllTemplateTypes(): MessageType[] {
  return Object.keys(MESSAGE_TEMPLATES) as MessageType[];
}

/**
 * Validate if all required variables are provided
 */
export function validateMessageVariables(
  type: MessageType,
  variables: Partial<MessageVariables>
): { valid: boolean; missing: string[] } {
  const template = MESSAGE_TEMPLATES[type];
  const missing: string[] = [];

  template.variables.forEach((varName) => {
    if (varName === 'tableNumber') {
      // Table number is optional for most message types
      return;
    }
    if (!variables[varName as keyof MessageVariables]) {
      missing.push(varName);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Preview message with sample data
 */
export function getPreviewMessage(type: MessageType): string {
  const sampleVariables: MessageVariables = {
    guestName: 'יוסי כהן',
    groomName: 'דוד',
    brideName: 'שרה',
    eventDate: 'יום שישי, 15 במאי 2025',
    eventTime: '18:00',
    venue: 'אולמי גן האירועים',
    rsvpLink: 'https://example.com/rsvp/abc123',
    tableNumber: 5,
    appUrl: 'https://example.com',
  };

  return generateMessage(type, sampleVariables);
}
