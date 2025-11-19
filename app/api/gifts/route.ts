import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Guest from '@/lib/db/models/Guest';
import Wedding from '@/lib/db/models/Wedding';

// GET - Get gift statistics for a wedding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Wedding ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    }).lean() as any;

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Get all guests with gifts
    const guests = await Guest.find({
      weddingId,
      $or: [
        { giftAmount: { $gt: 0 } },
        { giftMethod: { $ne: 'none' } },
      ],
    })
      .select('name phone giftAmount giftMethod rsvpStatus createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate statistics
    const totalGifts = guests.reduce((sum, guest) => sum + (guest.giftAmount || 0), 0);
    const giftsByMethod = {
      bit: guests.filter((g) => g.giftMethod === 'bit').length,
      paybox: guests.filter((g) => g.giftMethod === 'paybox').length,
    };

    // Get total guests count
    const totalGuests = await Guest.countDocuments({ weddingId });
    const confirmedGuests = await Guest.countDocuments({ weddingId, rsvpStatus: 'confirmed' });

    return NextResponse.json({
      statistics: {
        totalGifts,
        guestsWithGifts: guests.length,
        totalGuests,
        confirmedGuests,
        giftsByMethod,
        averageGift: guests.length > 0 ? Math.round(totalGifts / guests.length) : 0,
        giftRate: confirmedGuests > 0
          ? Math.round((guests.length / confirmedGuests) * 100)
          : 0,
      },
      gifts: guests.map((guest) => ({
        guestId: guest._id,
        name: guest.name,
        phone: guest.phone,
        amount: guest.giftAmount || 0,
        method: guest.giftMethod || 'none',
        rsvpStatus: guest.rsvpStatus,
        date: guest.updatedAt,
      })),
      paymentLinks: {
        bit: wedding.bitPhone
          ? `https://www.bitpay.co.il/app/users/${wedding.bitPhone}`
          : null,
        paybox: wedding.payboxPhone
          ? `https://payboxapp.page.link/?link=https://payboxapp.com/payment?phone=${wedding.payboxPhone}`
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 });
  }
}

// POST - Log a gift from a guest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestToken, amount, method } = body;

    // Can be called by guest (with token) or admin (with session)
    if (!guestToken && !body.guestId) {
      return NextResponse.json(
        { error: 'Guest token or ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    let guest;

    if (guestToken) {
      // Guest is logging their own gift
      guest = await Guest.findOne({ uniqueToken: guestToken });
    } else {
      // Admin is logging gift for a guest
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      guest = await Guest.findById(body.guestId);

      if (guest) {
        // Verify the wedding belongs to this user
        const wedding = await Wedding.findOne({
          _id: guest.weddingId,
          userId: session.user.id,
        });

        if (!wedding) {
          return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
        }
      }
    }

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Update guest with gift info
    if (amount !== undefined) {
      guest.giftAmount = amount;
    }

    if (method) {
      guest.giftMethod = method;
    }

    await guest.save();

    return NextResponse.json({
      message: 'Gift logged successfully',
      gift: {
        amount: guest.giftAmount,
        method: guest.giftMethod,
      },
    });
  } catch (error) {
    console.error('Error logging gift:', error);
    return NextResponse.json({ error: 'Failed to log gift' }, { status: 500 });
  }
}
