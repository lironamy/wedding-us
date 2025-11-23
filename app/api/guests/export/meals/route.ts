import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as XLSX from 'xlsx';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';

// Helper function to set RTL for worksheet
function setWorksheetRTL(worksheet: XLSX.WorkSheet) {
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ RTL: true });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get user's wedding
    const wedding = await Wedding.findOne({
      userId: session.user.id,
      status: { $ne: 'archived' },
    }).lean() as any;

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Get confirmed guests for this wedding
    const guests = await Guest.find({
      weddingId: wedding._id,
      rsvpStatus: 'confirmed'
    })
      .sort({ name: 1 })
      .lean() as any[];

    // Calculate meal totals
    const mealTotals = {
      regular: guests.reduce((sum, g) => sum + (g.regularMeals || 0), 0),
      vegetarian: guests.reduce((sum, g) => sum + (g.vegetarianMeals || 0), 0),
      vegan: guests.reduce((sum, g) => sum + (g.veganMeals || 0), 0),
      other: guests.reduce((sum, g) => sum + (g.otherMeals || 0), 0),
    };

    const totalMeals = mealTotals.regular + mealTotals.vegetarian + mealTotals.vegan + mealTotals.other;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    // Set workbook to RTL
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    workbook.Workbook.Views.push({ RTL: true });

    // Sheet 1: Meal Summary
    const summaryData = [
      { 'סוג מנה': 'רגיל', 'כמות': mealTotals.regular },
      { 'סוג מנה': 'צמחוני', 'כמות': mealTotals.vegetarian },
      { 'סוג מנה': 'טבעוני', 'כמות': mealTotals.vegan },
      { 'סוג מנה': 'אחר', 'כמות': mealTotals.other },
      { 'סוג מנה': '', 'כמות': '' },
      { 'סוג מנה': 'סה"כ מנות', 'כמות': totalMeals },
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 10 }];
    setWorksheetRTL(summaryWorksheet);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'סיכום מנות');

    // Sheet 2: Detailed breakdown by guest
    const detailedData = guests
      .filter(g => (g.regularMeals || 0) + (g.vegetarianMeals || 0) + (g.veganMeals || 0) + (g.otherMeals || 0) > 0)
      .map((guest) => ({
        'שם אורח': guest.name,
        'טלפון': guest.phone,
        'רגיל': guest.regularMeals || 0,
        'צמחוני': guest.vegetarianMeals || 0,
        'טבעוני': guest.veganMeals || 0,
        'אחר': guest.otherMeals || 0,
        'פירוט אחר': guest.otherMealDescription || '',
        'סה"כ מנות': (guest.regularMeals || 0) + (guest.vegetarianMeals || 0) + (guest.veganMeals || 0) + (guest.otherMeals || 0),
        'הערות': guest.notes || '',
        'בקשות מיוחדות': guest.specialMealRequests || '',
      }));

    const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData);
    detailedWorksheet['!cols'] = [
      { wch: 20 }, // שם אורח
      { wch: 15 }, // טלפון
      { wch: 8 },  // רגיל
      { wch: 8 },  // צמחוני
      { wch: 8 },  // טבעוני
      { wch: 8 },  // אחר
      { wch: 30 }, // פירוט אחר
      { wch: 12 }, // סה"כ מנות
      { wch: 30 }, // הערות
      { wch: 30 }, // בקשות מיוחדות
    ];
    setWorksheetRTL(detailedWorksheet);
    XLSX.utils.book_append_sheet(workbook, detailedWorksheet, 'פירוט לפי אורח');

    // Sheet 3: Other meals details only
    const otherMealsData = guests
      .filter(g => (g.otherMeals || 0) > 0)
      .map((guest) => ({
        'שם אורח': guest.name,
        'טלפון': guest.phone,
        'כמות מנות': guest.otherMeals,
        'פירוט הבקשה': guest.otherMealDescription || 'לא צוין פירוט',
        'הערות נוספות': guest.notes || '',
      }));

    if (otherMealsData.length > 0) {
      const otherWorksheet = XLSX.utils.json_to_sheet(otherMealsData);
      otherWorksheet['!cols'] = [
        { wch: 20 }, // שם אורח
        { wch: 15 }, // טלפון
        { wch: 12 }, // כמות מנות
        { wch: 40 }, // פירוט הבקשה
        { wch: 30 }, // הערות נוספות
      ];
      setWorksheetRTL(otherWorksheet);
      XLSX.utils.book_append_sheet(workbook, otherWorksheet, 'מנות אחר - פירוט');
    }

    // Sheet 4: Vegetarian meals list
    const vegetarianData = guests
      .filter(g => (g.vegetarianMeals || 0) > 0)
      .map((guest) => ({
        'שם אורח': guest.name,
        'טלפון': guest.phone,
        'כמות מנות צמחוניות': guest.vegetarianMeals,
        'הערות': guest.notes || '',
      }));

    if (vegetarianData.length > 0) {
      const vegWorksheet = XLSX.utils.json_to_sheet(vegetarianData);
      vegWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }];
      setWorksheetRTL(vegWorksheet);
      XLSX.utils.book_append_sheet(workbook, vegWorksheet, 'צמחוני');
    }

    // Sheet 5: Vegan meals list
    const veganData = guests
      .filter(g => (g.veganMeals || 0) > 0)
      .map((guest) => ({
        'שם אורח': guest.name,
        'טלפון': guest.phone,
        'כמות מנות טבעוניות': guest.veganMeals,
        'הערות': guest.notes || '',
      }));

    if (veganData.length > 0) {
      const veganWorksheet = XLSX.utils.json_to_sheet(veganData);
      veganWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }];
      setWorksheetRTL(veganWorksheet);
      XLSX.utils.book_append_sheet(workbook, veganWorksheet, 'טבעוני');
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    const date = new Date().toISOString().split('T')[0];
    const filename = `meals_summary_${date}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Meals export error:', error);
    return NextResponse.json(
      { error: 'Failed to export meals' },
      { status: 500 }
    );
  }
}
