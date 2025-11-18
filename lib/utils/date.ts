export function formatHebrewDate(date: Date): string {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const months = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `יום ${dayName}, ${day} ב${month} ${year}`;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('he-IL');
}

export function isEventPast(eventDate: Date): boolean {
  return eventDate < new Date();
}

export function getDaysUntilEvent(eventDate: Date): number {
  const today = new Date();
  const timeDiff = eventDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}
