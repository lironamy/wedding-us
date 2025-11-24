import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getInvoice4UService } from '@/lib/services/invoice4u';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, packageGuests, amount } = body;

    // Validate
    if (!weddingId || !packageGuests || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Free package - no payment needed
    if (amount === 0 || packageGuests <= 200) {
      await dbConnect();

      // Update wedding with selected package
      await Wedding.findByIdAndUpdate(weddingId, {
        maxGuests: packageGuests,
        paymentStatus: 'free',
      });

      return NextResponse.json({
        success: true,
        paymentRequired: false,
        message: 'חבילה חינמית הופעלה בהצלחה',
      });
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

    // Create clearing request via Invoice4U
    const invoice4u = getInvoice4UService();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const orderId = `wedding-${weddingId}-${Date.now()}`;

    // Debug: Check if API key is configured
    if (!process.env.INVOICE4U_API_KEY) {
      console.error('INVOICE4U_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    console.log('Creating clearing request for:', { weddingId, packageGuests, amount });

    const clearingResult = await invoice4u.createClearingRequest({
      amount,
      customerEmail: session.user.email || '',
      customerName: session.user.name || '',
      customerPhone: '', // Will be filled by user in iframe
      description: `שדרוג חבילה ל-${packageGuests} מוזמנים`,
      returnUrl: `${appUrl}/dashboard/payment/callback?weddingId=${weddingId}&package=${packageGuests}&orderId=${orderId}`,
      orderId,
      createDocument: true,
      documentHeadline: `קבלה - שדרוג חבילה ל-${packageGuests} מוזמנים`,
      documentComments: `פלטפורמת חתונות - ${wedding.groomName} & ${wedding.brideName}`,
    });

    if (!clearingResult.success) {
      console.error('Invoice4U clearing failed:', clearingResult);
      return NextResponse.json(
        { error: clearingResult.error || 'Payment creation failed' },
        { status: 500 }
      );
    }

    console.log('Clearing URL received:', clearingResult.clearingUrl);

    // Save pending payment info to wedding
    await Wedding.findByIdAndUpdate(weddingId, {
      pendingPayment: {
        transactionId: orderId,
        amount,
        packageGuests,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      paymentRequired: true,
      clearingUrl: clearingResult.clearingUrl, // URL for iframe
      orderId,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
