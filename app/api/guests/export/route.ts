import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as XLSX from 'xlsx';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';

export async function GET(request: Request) {
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

    // Get all guests for this wedding
    const guests = await Guest.find({ weddingId: wedding._id })
      .sort({ createdAt: -1 })
      .lean() as any[];

    // Prepare data for Excel
    const excelData = guests.map((guest) => ({
      'שם': guest.name,
      'טלפון נייד': guest.phone,
      'אימייל': guest.email || '',
      'קבוצה משפחתית': guest.familyGroup || '',
      'מספר מוזמנים': guest.invitedCount,
      'סטטוס': guest.rsvpStatus === 'confirmed' ? 'אישר' : guest.rsvpStatus === 'declined' ? 'סירב' : 'ממתין',
      'מבוגרים מגיעים': guest.adultsAttending || 0,
      'ילדים מגיעים': guest.childrenAttending || 0,
      'סה"כ מגיעים': (guest.adultsAttending || 0) + (guest.childrenAttending || 0),
      'בקשות מיוחדות': guest.specialMealRequests || '',
      'הערות': guest.notes || '',
      'שולחן': guest.tableNumber || '',
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // שם
      { wch: 15 }, // טלפון נייד
      { wch: 25 }, // אימייל
      { wch: 15 }, // קבוצה משפחתית
      { wch: 12 }, // מספר מוזמנים
      { wch: 10 }, // סטטוס
      { wch: 15 }, // מבוגרים מגיעים
      { wch: 12 }, // ילדים מגיעים
      { wch: 12 }, // סה"כ מגיעים
      { wch: 25 }, // בקשות מיוחדות
      { wch: 25 }, // הערות
      { wch: 10 }, // שולחן
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'אורחים');

    // Add summary sheet
    const summaryData = [
      { 'סטטיסטיקה': 'סה"כ אורחים', 'ערך': guests.length },
      { 'סטטיסטיקה': 'אישרו הגעה', 'ערך': guests.filter(g => g.rsvpStatus === 'confirmed').length },
      { 'סטטיסטיקה': 'סירבו', 'ערך': guests.filter(g => g.rsvpStatus === 'declined').length },
      { 'סטטיסטיקה': 'ממתינים', 'ערך': guests.filter(g => g.rsvpStatus === 'pending').length },
      { 'סטטיסטיקה': 'סה"כ מבוגרים מגיעים', 'ערך': guests.reduce((sum, g) => sum + (g.adultsAttending || 0), 0) },
      { 'סטטיסטיקה': 'סה"כ ילדים מגיעים', 'ערך': guests.reduce((sum, g) => sum + (g.childrenAttending || 0), 0) },
      { 'סטטיסטיקה': 'סה"כ מגיעים', 'ערך': guests.reduce((sum, g) => sum + (g.adultsAttending || 0) + (g.childrenAttending || 0), 0) },
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'סיכום');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    const date = new Date().toISOString().split('T')[0];
    const filename = `guests_${date}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export guests' },
      { status: 500 }
    );
  }
}
