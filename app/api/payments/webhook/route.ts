import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { getInvoice4UService } from '@/lib/services/invoice4u';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, status, order_id } = body;

    console.log('Payment webhook received:', { transaction_id, status, order_id });

    if (!transaction_id) {
      return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    await dbConnect();

    // Find wedding by pending payment transaction ID
    const wedding = await Wedding.findOne({
      'pendingPayment.transactionId': transaction_id,
    });

    if (!wedding) {
      console.error('Wedding not found for transaction:', transaction_id);
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    if (status === 'completed' || status === 'success') {
      // Payment successful - update wedding
      const packageGuests = wedding.pendingPayment?.packageGuests || 200;
      const amount = wedding.pendingPayment?.amount || 0;

      wedding.maxGuests = packageGuests;
      wedding.paymentStatus = 'paid';
      wedding.paymentDetails = {
        transactionId: transaction_id,
        amount,
        paidAt: new Date(),
        packageGuests,
      };
      wedding.pendingPayment = undefined;

      await wedding.save();

      // Invoice4U sends receipt automatically - no need to call API
      console.log('Payment completed for wedding:', wedding._id);
    } else if (status === 'failed' || status === 'cancelled') {
      // Payment failed - clear pending payment
      wedding.pendingPayment = undefined;
      await wedding.save();

      console.log('Payment failed/cancelled for wedding:', wedding._id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Also handle GET for verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('payment_id');

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment_id' }, { status: 400 });
  }

  try {
    const invoice4u = getInvoice4UService();
    const result = await invoice4u.getClearingLog(paymentId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
