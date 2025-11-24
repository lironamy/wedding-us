import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, packageGuests, orderId, success } = body;

    if (!weddingId || !packageGuests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify the wedding belongs to this user
    const wedding = await Wedding.findOne({
      _id: weddingId,
      userId: session.user.id,
    });

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Verify the pending payment matches
    if (wedding.pendingPayment?.transactionId !== orderId) {
      console.warn('Order ID mismatch:', {
        expected: wedding.pendingPayment?.transactionId,
        received: orderId
      });
    }

    if (success) {
      // Payment successful - update wedding
      wedding.maxGuests = packageGuests;
      wedding.paymentStatus = 'paid';
      wedding.paymentDetails = {
        transactionId: orderId,
        amount: wedding.pendingPayment?.amount || 0,
        paidAt: new Date(),
        packageGuests,
      };
      wedding.pendingPayment = undefined;

      await wedding.save();

      console.log('Payment completed for wedding:', weddingId, 'Package:', packageGuests);

      return NextResponse.json({
        success: true,
        message: 'החבילה עודכנה בהצלחה',
      });
    } else {
      // Payment failed - clear pending payment
      wedding.pendingPayment = undefined;
      wedding.paymentStatus = 'failed';
      await wedding.save();

      return NextResponse.json({
        success: false,
        error: 'התשלום נכשל',
      });
    }
  } catch (error) {
    console.error('Payment complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete payment' },
      { status: 500 }
    );
  }
}
