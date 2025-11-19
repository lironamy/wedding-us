import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';

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

    // Get all guests for this wedding
    const guests = await Guest.find({ weddingId: wedding._id })
      .sort({ createdAt: -1 })
      .lean() as any[];

    // Calculate statistics
    const stats = {
      totalGuests: guests.length,
      confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
      declined: guests.filter(g => g.rsvpStatus === 'declined').length,
      pending: guests.filter(g => g.rsvpStatus === 'pending').length,
      totalInvited: guests.reduce((sum, g) => sum + (g.invitedCount || 0), 0),
      totalAdults: guests.reduce((sum, g) => sum + (g.adultsAttending || 0), 0),
      totalChildren: guests.reduce((sum, g) => sum + (g.childrenAttending || 0), 0),
      totalGifts: guests.reduce((sum, g) => sum + (g.giftAmount || 0), 0),
    };

    // Group by family
    const familyGroups: Record<string, { total: number; confirmed: number; attending: number }> = {};
    guests.forEach(guest => {
      const group = guest.familyGroup || 'ללא קבוצה';
      if (!familyGroups[group]) {
        familyGroups[group] = { total: 0, confirmed: 0, attending: 0 };
      }
      familyGroups[group].total += 1;
      if (guest.rsvpStatus === 'confirmed') {
        familyGroups[group].confirmed += 1;
        familyGroups[group].attending += (guest.adultsAttending || 0) + (guest.childrenAttending || 0);
      }
    });

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add Hebrew font support (basic)
    doc.setFont('helvetica');

    // Title
    const eventDate = new Date(wedding.eventDate).toLocaleDateString('he-IL');
    doc.setFontSize(20);
    doc.text(`${wedding.groomName} & ${wedding.brideName}`, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Wedding Statistics - ${eventDate}`, 105, 30, { align: 'center' });

    // Main statistics table
    const statsData = [
      ['Total Guests', stats.totalGuests.toString()],
      ['Total Invited', stats.totalInvited.toString()],
      ['Confirmed', stats.confirmed.toString()],
      ['Declined', stats.declined.toString()],
      ['Pending', stats.pending.toString()],
      ['Adults Attending', stats.totalAdults.toString()],
      ['Children Attending', stats.totalChildren.toString()],
      ['Total Attending', (stats.totalAdults + stats.totalChildren).toString()],
      ['Total Gifts', `${stats.totalGifts.toLocaleString()} NIS`],
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Statistic', 'Value']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [196, 165, 123] },
      styles: { halign: 'center' },
    });

    // Family groups table
    const familyData = Object.entries(familyGroups).map(([name, data]) => [
      name,
      data.total.toString(),
      data.confirmed.toString(),
      data.attending.toString(),
    ]);

    if (familyData.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
        head: [['Family Group', 'Total', 'Confirmed', 'Attending']],
        body: familyData,
        theme: 'grid',
        headStyles: { fillColor: [196, 165, 123] },
        styles: { halign: 'center' },
      });
    }

    // Confirmed guests list
    const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed');
    if (confirmedGuests.length > 0) {
      const confirmedData = confirmedGuests.map(g => [
        g.name,
        g.familyGroup || '-',
        (g.adultsAttending || 0).toString(),
        (g.childrenAttending || 0).toString(),
        g.specialMealRequests || '-',
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
        head: [['Name', 'Group', 'Adults', 'Children', 'Special Requests']],
        body: confirmedData,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { halign: 'center', fontSize: 8 },
      });
    }

    // Generate buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return as downloadable file
    const date = new Date().toISOString().split('T')[0];
    const filename = `statistics_${date}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
