/**
 * Gender-aware text utility for Hebrew
 * Handles plural forms based on partner types (groom/bride combinations)
 */

export type PartnerType = 'groom' | 'bride';

export interface GenderTextOptions {
  partner1Type: PartnerType;
  partner2Type: PartnerType;
}

/**
 * Determines the grammatical gender for plural forms
 * In Hebrew:
 * - Two males (groom + groom) = masculine plural
 * - Two females (bride + bride) = feminine plural
 * - Mixed (groom + bride) = masculine plural (standard Hebrew grammar)
 */
export function getGrammaticalGender(
  partner1Type: PartnerType,
  partner2Type: PartnerType
): 'masculine' | 'feminine' {
  // Both are brides = feminine plural
  if (partner1Type === 'bride' && partner2Type === 'bride') {
    return 'feminine';
  }
  // Any other combination (including mixed) = masculine plural
  return 'masculine';
}

/**
 * Common gender-aware text phrases for wedding invitations
 */
export const genderTexts = {
  // "שמחים/שמחות"
  happy: {
    masculine: 'שמחים',
    feminine: 'שמחות',
  },
  // "מתרגשים/מתרגשות"
  excited: {
    masculine: 'מתרגשים',
    feminine: 'מתרגשות',
  },
  // "נרגשים/נרגשות"
  thrilled: {
    masculine: 'נרגשים',
    feminine: 'נרגשות',
  },
  // "מזמינים/מזמינות"
  inviting: {
    masculine: 'מזמינים',
    feminine: 'מזמינות',
  },
  // "מחכים/מחכות"
  waiting: {
    masculine: 'מחכים',
    feminine: 'מחכות',
  },
  // "מקווים/מקוות"
  hoping: {
    masculine: 'מקווים',
    feminine: 'מקוות',
  },
  // "אסירי/אסירות תודה"
  grateful: {
    masculine: 'אסירי',
    feminine: 'אסירות',
  },
  // "מתחתנים/מתחתנות"
  gettingMarried: {
    masculine: 'מתחתנים',
    feminine: 'מתחתנות',
  },
  // "רוצים/רוצות"
  wanting: {
    masculine: 'רוצים',
    feminine: 'רוצות',
  },
};

export type GenderTextKey = keyof typeof genderTexts;

/**
 * Get gender-appropriate text
 */
export function getGenderText(
  key: GenderTextKey,
  partner1Type: PartnerType,
  partner2Type: PartnerType
): string {
  const gender = getGrammaticalGender(partner1Type, partner2Type);
  return genderTexts[key][gender];
}

/**
 * Get all gender texts for a specific combination
 */
export function getAllGenderTexts(
  partner1Type: PartnerType,
  partner2Type: PartnerType
): Record<GenderTextKey, string> {
  const gender = getGrammaticalGender(partner1Type, partner2Type);
  const result: Record<string, string> = {};

  for (const key of Object.keys(genderTexts) as GenderTextKey[]) {
    result[key] = genderTexts[key][gender];
  }

  return result as Record<GenderTextKey, string>;
}

/**
 * Replace gender placeholders in a template string
 * Placeholders format: {gender:key} e.g., {gender:happy}, {gender:excited}
 */
export function replaceGenderPlaceholders(
  template: string,
  partner1Type: PartnerType,
  partner2Type: PartnerType
): string {
  const texts = getAllGenderTexts(partner1Type, partner2Type);
  let result = template;

  for (const [key, value] of Object.entries(texts)) {
    result = result.replace(new RegExp(`\\{gender:${key}\\}`, 'g'), value);
  }

  return result;
}
