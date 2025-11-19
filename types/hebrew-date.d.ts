declare module 'hebrew-date' {
  interface HebrewDateResult {
    year: number;
    month: number;
    date: number;
    month_name: string;
  }

  export default function hebrewDate(date?: Date): HebrewDateResult;
}

