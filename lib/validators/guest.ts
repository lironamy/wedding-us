import { z } from 'zod';

// Phone number validation (Israeli format)
const phoneRegex = /^(\+972|0)?[1-9]\d{7,9}$/;

export const guestSchema = z.object({
  name: z
    .string()
    .min(2, 'שם האורח חייב להכיל לפחות 2 תווים')
    .max(100, 'שם האורח ארוך מדי'),
  phone: z
    .string()
    .regex(phoneRegex, 'מספר טלפון לא תקין'),
  email: z
    .string()
    .email('כתובת אימייל לא תקינה')
    .optional()
    .or(z.literal('')),
  familyGroup: z.string().max(50, 'שם הקבוצה המשפחתית ארוך מדי').optional(),
  invitedCount: z
    .number()
    .min(1, 'מספר המוזמנים חייב להיות לפחות 1')
    .max(50, 'מספר המוזמנים גבוה מדי')
    .optional(),
  notes: z.string().max(500, 'ההערות ארוכות מדי').optional(),
});

export const rsvpSchema = z.object({
  uniqueToken: z.string().uuid('קישור לא תקין'),
  rsvpStatus: z.enum(['confirmed', 'declined'], {
    message: 'סטטוס לא תקין'
  }),
  adultsAttending: z
    .number()
    .min(0, 'מספר מבוגרים לא יכול להיות שלילי')
    .optional()
    .default(0),
  childrenAttending: z
    .number()
    .min(0, 'מספר ילדים לא יכול להיות שלילי')
    .optional()
    .default(0),
  specialMealRequests: z.string().max(500, 'בקשות מיוחדות ארוכות מדי').optional(),
  notes: z.string().max(500, 'ההערות ארוכות מדי').optional(),
});

export const updateGuestSchema = z.object({
  name: z
    .string()
    .min(2, 'שם האורח חייב להכיל לפחות 2 תווים')
    .max(100, 'שם האורח ארוך מדי')
    .optional(),
  phone: z
    .string()
    .regex(phoneRegex, 'מספר טלפון לא תקין')
    .optional(),
  email: z
    .string()
    .email('כתובת אימייל לא תקינה')
    .optional()
    .or(z.literal('')),
  familyGroup: z.string().max(50, 'שם הקבוצה המשפחתית ארוך מדי').optional(),
  invitedCount: z
    .number()
    .min(1, 'מספר המוזמנים חייב להיות לפחות 1')
    .max(50, 'מספר המוזמנים גבוה מדי')
    .optional(),
  tableAssignment: z.string().max(50, 'שם השולחן ארוך מדי').optional(),
  tableNumber: z.number().min(1, 'מספר שולחן לא תקין').optional(),
  notes: z.string().max(500, 'ההערות ארוכות מדי').optional(),
});

export const bulkGuestImportSchema = z.array(guestSchema);

export type GuestInput = z.infer<typeof guestSchema>;
export type RSVPInput = z.infer<typeof rsvpSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type BulkGuestImportInput = z.infer<typeof bulkGuestImportSchema>;
