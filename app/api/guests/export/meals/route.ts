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

    // Get custom meal name for "other"
    const customOtherMealName = wedding.customOtherMealName || 'אחר';

    // Calculate meal totals
    const mealTotals = {
      regular: guests.reduce((sum, g) => sum + (g.regularMeals || 0), 0),
      vegetarian: guests.reduce((sum, g) => sum + (g.vegetarianMeals || 0), 0),
      vegan: guests.reduce((sum, g) => sum + (g.veganMeals || 0), 0),
      kids: guests.reduce((sum, g) => sum + (g.kidsMeals || 0), 0),
      glutenFree: guests.reduce((sum, g) => sum + (g.glutenFreeMeals || 0), 0),
      other: guests.reduce((sum, g) => sum + (g.otherMeals || 0), 0),
    };

    const totalMeals = mealTotals.regular + mealTotals.vegetarian + mealTotals.vegan + mealTotals.kids + mealTotals.glutenFree + mealTotals.other;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    // Set workbook to RTL
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    workbook.Workbook.Views.push({ RTL: true });

    // Get all other meal descriptions
    const otherMealDescriptions = guests
      .filter(g => (g.otherMeals || 0) > 0 && g.otherMealDescription)
      .map(g => `${g.name}: ${g.otherMealDescription} (${g.otherMeals})`);

    // Sheet 1: Meal Summary
    const summaryData: any[] = [
      { 'סוג מנה': 'רגיל', 'כמות': mealTotals.regular, 'פירוט': '' },
      { 'סוג מנה': 'צמחוני', 'כמות': mealTotals.vegetarian, 'פירוט': '' },
      { 'סוג מנה': 'טבעוני', 'כמות': mealTotals.vegan, 'פירוט': '' },
      { 'סוג מנה': 'ילדים', 'כמות': mealTotals.kids, 'פירוט': '' },
      { 'סוג מנה': 'ללא גלוטן', 'כמות': mealTotals.glutenFree, 'פירוט': '' },
      { 'סוג מנה': customOtherMealName, 'כמות': mealTotals.other, 'פירוט': '' },
      { 'סוג מנה': '', 'כמות': '', 'פירוט': '' },
      { 'סוג מנה': 'סה"כ מנות', 'כמות': totalMeals, 'פירוט': '' },
    ];

    // Add other meal descriptions section (only if no custom name was set)
    if (otherMealDescriptions.length > 0 && !wedding.customOtherMealName) {
      summaryData.push({ 'סוג מנה': '', 'כמות': '', 'פירוט': '' });
      summaryData.push({ 'סוג מנה': `--- פירוט מנות "${customOtherMealName}" ---`, 'כמות': '', 'פירוט': '' });
      otherMealDescriptions.forEach(desc => {
        summaryData.push({ 'סוג מנה': desc, 'כמות': '', 'פירוט': '' });
      });
    }

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 50 }, { wch: 10 }, { wch: 40 }];
    setWorksheetRTL(summaryWorksheet);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'סיכום מנות');

    // Sheet 2: Detailed breakdown by guest
    const detailedData = guests
      .filter(g => (g.regularMeals || 0) + (g.vegetarianMeals || 0) + (g.veganMeals || 0) + (g.kidsMeals || 0) + (g.glutenFreeMeals || 0) + (g.otherMeals || 0) > 0)
      .map((guest) => {
        const row: Record<string, any> = {
          'שם אורח': guest.name,
          'טלפון נייד': guest.phone,
          'רגיל': guest.regularMeals || 0,
          'צמחוני': guest.vegetarianMeals || 0,
          'טבעוני': guest.veganMeals || 0,
          'ילדים': guest.kidsMeals || 0,
          'ללא גלוטן': guest.glutenFreeMeals || 0,
        };
        row[customOtherMealName] = guest.otherMeals || 0;
        row[`פירוט ${customOtherMealName}`] = guest.otherMealDescription || '';
        row['סה"כ מנות'] = (guest.regularMeals || 0) + (guest.vegetarianMeals || 0) + (guest.veganMeals || 0) + (guest.kidsMeals || 0) + (guest.glutenFreeMeals || 0) + (guest.otherMeals || 0);
        row['הערות'] = guest.notes || '';
        row['בקשות מיוחדות'] = guest.specialMealRequests || '';
        return row;
      });

    const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData);
    detailedWorksheet['!cols'] = [
      { wch: 20 }, // שם אורח
      { wch: 15 }, // טלפון נייד
      { wch: 8 },  // רגיל
      { wch: 8 },  // צמחוני
      { wch: 8 },  // טבעוני
      { wch: 8 },  // ילדים
      { wch: 10 }, // ללא גלוטן
      { wch: 10 }, // אחר/מותאם
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
        'טלפון נייד': guest.phone,
        'כמות מנות': guest.otherMeals,
        'פירוט הבקשה': guest.otherMealDescription || 'לא צוין פירוט',
        'הערות נוספות': guest.notes || '',
      }));

    if (otherMealsData.length > 0) {
      const otherWorksheet = XLSX.utils.json_to_sheet(otherMealsData);
      otherWorksheet['!cols'] = [
        { wch: 20 }, // שם אורח
        { wch: 15 }, // טלפון נייד
        { wch: 12 }, // כמות מנות
        { wch: 40 }, // פירוט הבקשה
        { wch: 30 }, // הערות נוספות
      ];
      setWorksheetRTL(otherWorksheet);
      // Use custom name for sheet title (truncate if too long for Excel)
      const sheetName = `מנות ${customOtherMealName}`.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, otherWorksheet, sheetName);
    }

    // Sheet 4: Vegetarian meals list
    const vegetarianData = guests
      .filter(g => (g.vegetarianMeals || 0) > 0)
      .map((guest) => ({
        'שם אורח': guest.name,
        'טלפון נייד': guest.phone,
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
        'טלפון נייד': guest.phone,
        'כמות מנות טבעוניות': guest.veganMeals,
        'הערות': guest.notes || '',
      }));

    if (veganData.length > 0) {
      const veganWorksheet = XLSX.utils.json_to_sheet(veganData);
      veganWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }];
      setWorksheetRTL(veganWorksheet);
      XLSX.utils.book_append_sheet(workbook, veganWorksheet, 'טבעוני');
    }

    // Sheet 6: Kids meals list
    const kidsData = guests
      .filter(g => (g.kidsMeals || 0) > 0)
      .map((guest) => ({
        'שם אורח': guest.name,
        'טלפון נייד': guest.phone,
        'כמות מנות ילדים': guest.kidsMeals,
        'הערות': guest.notes || '',
      }));

    if (kidsData.length > 0) {
      const kidsWorksheet = XLSX.utils.json_to_sheet(kidsData);
      kidsWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }];
      setWorksheetRTL(kidsWorksheet);
      XLSX.utils.book_append_sheet(workbook, kidsWorksheet, 'ילדים');
    }

    // Sheet 7: Gluten-free meals list
    const glutenFreeData = guests
      .filter(g => (g.glutenFreeMeals || 0) > 0)
      .map((guest) => ({
        'שם אורח': guest.name,
        'טלפון נייד': guest.phone,
        'כמות מנות ללא גלוטן': guest.glutenFreeMeals,
        'הערות': guest.notes || '',
      }));

    if (glutenFreeData.length > 0) {
      const glutenFreeWorksheet = XLSX.utils.json_to_sheet(glutenFreeData);
      glutenFreeWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }];
      setWorksheetRTL(glutenFreeWorksheet);
      XLSX.utils.book_append_sheet(workbook, glutenFreeWorksheet, 'ללא גלוטן');
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
