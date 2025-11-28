import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export interface ExcelGuestRow {
  name: string;
  phone: string;
  email?: string;
  familyGroup?: string;
  invitedCount?: number;
}

export interface ParsedGuest {
  name: string;
  phone: string;
  email?: string;
  familyGroup?: string;
  invitedCount?: number;
  guestId: string;
  uniqueToken: string;
}

/**
 * Parse Excel file and extract guest data
 */
export function parseGuestExcel(buffer: Buffer): {
  guests: ParsedGuest[];
  errors: string[];
} {
  const guests: ParsedGuest[] = [];
  const errors: string[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (rows.length === 0) {
      errors.push('קובץ האקסל ריק');
      return { guests, errors };
    }

    // Process each row
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // Excel rows start at 1, header is row 1

      // Extract and normalize column names (support both Hebrew and English)
      const name =
        row['שם מלא'] ||
        row['שם'] ||
        row['Full Name'] ||
        row['Name'] ||
        row['name'] ||
        '';

      const phone =
        row['טלפון נייד'] ||
        row['מספר טלפון נייד'] ||
        row['Phone'] ||
        row['Phone Number'] ||
        row['phone'] ||
        '';

      const email =
        row['אימייל'] ||
        row['Email'] ||
        row['email'] ||
        '';

      const familyGroup =
        row['קבוצה משפחתית'] ||
        row['משפחה'] ||
        row['Family Group'] ||
        row['Family'] ||
        row['family'] ||
        '';

      const invitedCount =
        row['מספר מוזמנים'] ??
        row['Invited Count'] ??
        row['invitedCount'] ??
        row['Count'] ??
        '';

      // Validation
      if (!name || name.toString().trim() === '') {
        errors.push(`שורה ${rowNumber}: שם האורח חובה`);
        return;
      }

      if (!phone || phone.toString().trim() === '') {
        errors.push(`שורה ${rowNumber}: מספר טלפון נייד חובה`);
        return;
      }

      // Normalize phone number (remove spaces, dashes, etc.)
      const normalizedPhone = phone
        .toString()
        .replace(/[\s\-()]/g, '');

      // Validate phone format (basic validation for Israeli numbers)
      if (!/^(\+972|0)?[1-9]\d{7,9}$/.test(normalizedPhone)) {
        errors.push(`שורה ${rowNumber}: מספר טלפון נייד לא תקין`);
        return;
      }

      // Parse invited count (optional - if not set, no limit)
      const rawCount = invitedCount.toString().trim();
      let finalCount: number | undefined = undefined;
      if (rawCount !== '') {
        const parsed = parseInt(rawCount, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          finalCount = parsed;
        }
      }

      // Add guest
      guests.push({
        name: name.toString().trim(),
        phone: normalizedPhone,
        email: email ? email.toString().trim() : undefined,
        familyGroup: familyGroup ? familyGroup.toString().trim() : undefined,
        invitedCount: finalCount,
        guestId: uuidv4(),
        uniqueToken: uuidv4(),
      });
    });

    return { guests, errors };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    errors.push('שגיאה בקריאת קובץ האקסל');
    return { guests, errors };
  }
}

/**
 * Generate Excel template for guest import
 */
export function generateGuestTemplate(): Buffer {
  const templateData = [
    {
      'שם מלא': 'יוסי כהן',
      'טלפון נייד': '0501234567',
      'אימייל': 'yossi@example.com',
      'קבוצה משפחתית': 'משפחת כהן',
      'מספר מוזמנים': '',
    },
    {
      'שם מלא': 'שרה לוי',
      'טלפון נייד': '0527654321',
      'אימייל': '',
      'קבוצה משפחתית': 'משפחת לוי',
      'מספר מוזמנים': 4,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // שם מלא
    { wch: 15 }, // טלפון נייד
    { wch: 25 }, // אימייל
    { wch: 20 }, // קבוצה משפחתית
    { wch: 15 }, // מספר מוזמנים
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'אורחים');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const normalized = phone.replace(/[\s\-()]/g, '');
  return /^(\+972|0)?[1-9]\d{7,9}$/.test(normalized);
}

/**
 * Normalize phone number to international format
 */
export function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/[\s\-()]/g, '');

  // Convert Israeli format to international
  if (normalized.startsWith('0')) {
    normalized = '+972' + normalized.substring(1);
  } else if (!normalized.startsWith('+')) {
    normalized = '+972' + normalized;
  }

  return normalized;
}
