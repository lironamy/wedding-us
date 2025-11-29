// Shared types for all invitation templates

export interface MealOptions {
  regular: boolean;
  vegetarian: boolean;
  vegan: boolean;
  kids: boolean;
  glutenFree: boolean;
  other: boolean;
}

export interface WeddingData {
  _id: string;
  groomName: string;
  brideName: string;
  contactPhone?: string;
  partner1Type?: 'groom' | 'bride';
  partner2Type?: 'groom' | 'bride';
  eventDate: string;
  eventTime: string;
  chuppahTime?: string;
  venue: string;
  venueAddress: string;
  venueCoordinates?: { lat: number; lng: number };
  description?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaPosition?: { x: number; y: number }; // Position in percentage (0-100) for object-position
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  backgroundPattern?: string;
  invitationTemplate?: string;
  bitPhone?: string;
  payboxPhone?: string;
  bitQrImage?: string;
  enableBitGifts?: boolean;
  askAboutMeals?: boolean;
  mealOptions?: MealOptions;
  customOtherMealName?: string;
  maxGuests?: number;
  uniqueUrl: string;
  status: string;
}

export interface GuestData {
  _id: string;
  name: string;
  uniqueToken: string;
  invitedCount?: number;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  adultsAttending: number;
  childrenAttending: number;
  vegetarianMeals?: number;
  veganMeals?: number;
  kidsMeals?: number;
  glutenFreeMeals?: number;
  otherMeals?: number;
  otherMealDescription?: string;
  notes?: string;
}

export interface DateParts {
  day: number;
  month: string;
  year: number;
  weekday: string;
  hebrewDate: string;
  hebrewWeekday: string;
}

export interface InvitationTemplateProps {
  wedding: WeddingData;
  guest?: GuestData;
  dateParts: DateParts;
  isRSVP?: boolean;
  askAboutMeals?: boolean;
  mealOptions?: MealOptions;
  customOtherMealName?: string;
}

// Template metadata for selection
export interface TemplateInfo {
  id: string;
  name: string;
  nameHebrew: string;
  description: string;
  thumbnail: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Available templates registry
export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic Elegant',
    nameHebrew: 'קלאסי אלגנטי',
    description: 'העיצוב המקורי - נקי ואלגנטי',
    thumbnail: '/images/templates/classic.jpg',
    colors: { primary: '#555050', secondary: '#c2b57f', accent: '#fffff6' }
  },
  {
    id: 'romantic-garden',
    name: 'Romantic Garden',
    nameHebrew: 'גן רומנטי',
    description: 'צבעי מים, פרחים ותחושה רכה',
    thumbnail: '/images/templates/romantic-garden.jpg',
    colors: { primary: '#D4A5A5', secondary: '#8FBC8F', accent: '#FFFEF2' }
  },
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    nameHebrew: 'מינימליסטי יוקרתי',
    description: 'שחור לבן עם נגיעות זהב',
    thumbnail: '/images/templates/luxury-minimal.jpg',
    colors: { primary: '#1A1A1A', secondary: '#C9A962', accent: '#FFFFFF' }
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    nameHebrew: 'ארט דקו',
    description: 'גיאומטריה אלגנטית בסגנון שנות ה-20',
    thumbnail: '/images/templates/art-deco.jpg',
    colors: { primary: '#D4AF37', secondary: '#1C1C1C', accent: '#014421' }
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    nameHebrew: 'ליל כוכבים',
    description: 'קסם לילי עם כוכבים ואבק זהב',
    thumbnail: '/images/templates/starry-night.jpg',
    colors: { primary: '#191970', secondary: '#FFD700', accent: '#301934' }
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    nameHebrew: 'ים תיכוני',
    description: 'צבעי שקיעה וחום ים תיכוני',
    thumbnail: '/images/templates/mediterranean.jpg',
    colors: { primary: '#40E0D0', secondary: '#DAA520', accent: '#FFCBA4' }
  },
  {
    id: 'enchanted-forest',
    name: 'Enchanted Forest',
    nameHebrew: 'יער קסום',
    description: 'ירוק יער עם גחליליות ואלמנטים קסומים',
    thumbnail: '/images/templates/enchanted-forest.jpg',
    colors: { primary: '#228B22', secondary: '#FFD700', accent: '#0D1F0D' }
  },
  {
    id: 'marble-gold',
    name: 'Marble Gold',
    nameHebrew: 'שיש וזהב',
    description: 'טקסטורת שיש לבן עם נגיעות זהב יוקרתיות',
    thumbnail: '/images/templates/marble-gold.jpg',
    colors: { primary: '#2C3E50', secondary: '#D4AF37', accent: '#FFFFFF' }
  },
  {
    id: 'vintage-letters',
    name: 'Vintage Letters',
    nameHebrew: 'וינטג\' מכתבים',
    description: 'נייר עתיק עם בולים ותחרה',
    thumbnail: '/images/templates/vintage-letters.jpg',
    colors: { primary: '#8B4513', secondary: '#DEB887', accent: '#FFF8DC' }
  },
  {
    id: 'carnival',
    name: 'Carnival',
    nameHebrew: 'פארק שעשועים',
    description: 'צבעוני ושמח עם קונפטי וכוכבים',
    thumbnail: '/images/templates/carnival.jpg',
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D' }
  },
  {
    id: 'beach-shells',
    name: 'Beach Shells',
    nameHebrew: 'ים וצדפים',
    description: 'חוף הים עם צדפים, גלים ופנינים',
    thumbnail: '/images/templates/beach-shells.jpg',
    colors: { primary: '#4682B4', secondary: '#F5DEB3', accent: '#87CEEB' }
  },
  {
    id: 'japanese-zen',
    name: 'Japanese Zen',
    nameHebrew: 'יפני זן',
    description: 'מינימליזם יפני עם במבוק וחותם אדום',
    thumbnail: '/images/templates/japanese-zen.jpg',
    colors: { primary: '#2F4F4F', secondary: '#C41E3A', accent: '#F5F5DC' }
  },
  {
    id: 'jazz-club',
    name: 'Jazz Club',
    nameHebrew: 'מועדון ג\'אז',
    description: 'אווירת מועדון לילה עם ניאון וזהב',
    thumbnail: '/images/templates/jazz-club.jpg',
    colors: { primary: '#1A1A2E', secondary: '#E94560', accent: '#FFD700' }
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    nameHebrew: 'רנסנס',
    description: 'אלגנטיות קלאסית בסגנון ציור עתיק',
    thumbnail: '/images/templates/renaissance.jpg',
    colors: { primary: '#8B0000', secondary: '#DAA520', accent: '#FAF0E6' }
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    nameHebrew: 'סקנדינבי',
    description: 'עיצוב נורדי נקי עם עץ ורקע טבעי',
    thumbnail: '/images/templates/scandinavian.jpg',
    colors: { primary: '#4A5568', secondary: '#718096', accent: '#FFFFFF' }
  },
  {
    id: 'cyber-pastel',
    name: 'Cyber Pastel',
    nameHebrew: 'סייבר פסטל',
    description: 'גרדיאנטים פסטליים עם בועות צפות',
    thumbnail: '/images/templates/cyber-pastel.jpg',
    colors: { primary: '#A78BFA', secondary: '#F9A8D4', accent: '#67E8F9' }
  },
  {
    id: 'cosmic-galaxy',
    name: 'Cosmic Galaxy',
    nameHebrew: 'גלקטי',
    description: 'חלל וכוכבים עם ערפיליות צבעוניות',
    thumbnail: '/images/templates/cosmic-galaxy.jpg',
    colors: { primary: '#4B0082', secondary: '#FFD700', accent: '#00BFFF' }
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    nameHebrew: 'טרופי',
    description: 'עלי דקל, פרחים טרופיים וצבעים חמים',
    thumbnail: '/images/templates/tropical-paradise.jpg',
    colors: { primary: '#228B22', secondary: '#FF6347', accent: '#FFD700' }
  },
  {
    id: 'fairytale',
    name: 'Fairytale',
    nameHebrew: 'אגדות פיות',
    description: 'קסם של אגדה עם נצנוצים וכתר',
    thumbnail: '/images/templates/fairytale.jpg',
    colors: { primary: '#9370DB', secondary: '#FFD700', accent: '#E6E6FA' }
  },
  {
    id: 'industrial-chic',
    name: 'Industrial Chic',
    nameHebrew: 'תעשייתי',
    description: 'סגנון תעשייתי עם גלגלי שיניים ונורות אדיסון',
    thumbnail: '/images/templates/industrial-chic.jpg',
    colors: { primary: '#B87333', secondary: '#1C1C1C', accent: '#D4A574' }
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    nameHebrew: 'צבעי מים',
    description: 'כתמי צבעי מים רכים ומשיכות מכחול',
    thumbnail: '/images/templates/watercolor.jpg',
    colors: { primary: '#5C4C4C', secondary: '#AED9E0', accent: '#FFCCCB' }
  },
  {
    id: 'moroccan',
    name: 'Moroccan',
    nameHebrew: 'מרוקאי',
    description: 'פנסים מרוקאיים ודוגמאות זליג\'',
    thumbnail: '/images/templates/moroccan.jpg',
    colors: { primary: '#1E3A5F', secondary: '#C9A227', accent: '#30D5C8' }
  },
  {
    id: 'winter-wonderland',
    name: 'Winter Wonderland',
    nameHebrew: 'חורף קסום',
    description: 'פתיתי שלג וקריסטלי קרח',
    thumbnail: '/images/templates/winter-wonderland.jpg',
    colors: { primary: '#4169E1', secondary: '#9370DB', accent: '#A5F2F3' }
  },
  {
    id: 'botanical',
    name: 'Botanical',
    nameHebrew: 'בוטני מדעי',
    description: 'סגנון איור בוטני עם עלים וגבעולים',
    thumbnail: '/images/templates/botanical.jpg',
    colors: { primary: '#228B22', secondary: '#704214', accent: '#F5F5DC' }
  },
  {
    id: 'neon-futuristic',
    name: 'Neon Futuristic',
    nameHebrew: 'ניאון עתידני',
    description: 'סייבר פאנק עם אורות ניאון וגריד',
    thumbnail: '/images/templates/neon-futuristic.jpg',
    colors: { primary: '#FF00FF', secondary: '#00FFFF', accent: '#0D0D0D' }
  },
  {
    id: 'paper-cut',
    name: 'Paper Cut',
    nameHebrew: 'חיתוך נייר',
    description: 'שכבות נייר עם פרחים וציפורים בסגנון קיריגמי',
    thumbnail: '/images/templates/paper-cut.jpg',
    colors: { primary: '#5C8A9E', secondary: '#FFB6C1', accent: '#FFFFFF' }
  },
];
