import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import Guest from '@/lib/db/models/Guest';
import PackagePricing from '@/lib/db/models/PackagePricing';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, requestedPackage } = body;

    if (!weddingId || !requestedPackage) {
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

    // Check current guest count
    const currentGuestCount = await Guest.countDocuments({ weddingId });

    // If user has more guests than the requested package allows, reject
    if (currentGuestCount > requestedPackage) {
      return NextResponse.json({
        success: false,
        error: `יש לך כרגע ${currentGuestCount} אורחים. כדי לעבור לחבילה של ${requestedPackage} מוזמנים, יש למחוק ${currentGuestCount - requestedPackage} אורחים קודם.`,
        guestCount: currentGuestCount,
        requestedPackage,
      }, { status: 400 });
    }

    // All checks passed - return success to allow email sending
    return NextResponse.json({
      success: true,
      canProceed: true,
      guestCount: currentGuestCount,
    });
  } catch (error) {
    console.error('Refund request validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate refund request' },
      { status: 500 }
    );
  }
}

// Update wedding package after successful refund request
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weddingId, newPackage } = body;

    if (!weddingId || !newPackage) {
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

    // Get the new package price from database
    const newPackagePricing = await PackagePricing.findOne({ guests: newPackage, isActive: true });
    const newPackagePrice = newPackagePricing?.price || 0;

    // Store previous payment details for refund tracking
    const previousPaymentDetails = wedding.paymentDetails ? { ...wedding.paymentDetails.toObject() } : null;

    // Update the wedding with the new package
    wedding.maxGuests = newPackage;

    // Store refund request info
    wedding.refundRequest = {
      requestedAt: new Date(),
      previousPackage: previousPaymentDetails?.packageGuests || wedding.maxGuests,
      newPackage,
      previousAmount: previousPaymentDetails?.amount || 0,
      refundAmount: (previousPaymentDetails?.amount || 0) - newPackagePrice,
      status: 'pending', // Admin will process and update to 'completed'
    };

    // If moving to free package (200 guests), clear payment details
    if (newPackage <= 200) {
      wedding.paymentStatus = 'free';
      // Move paymentDetails to refundedPaymentDetails for history
      if (previousPaymentDetails) {
        wedding.refundedPaymentDetails = previousPaymentDetails;
      }
      wedding.paymentDetails = undefined;
    } else {
      // Update paymentDetails with new package info
      wedding.paymentDetails = {
        ...previousPaymentDetails,
        amount: newPackagePrice,
        packageGuests: newPackage,
        // Keep original transactionId and paidAt
      };
    }

    await wedding.save();

    console.log('Wedding package updated after refund request:', {
      weddingId,
      newPackage,
      previousPackage: wedding.refundRequest.previousPackage,
    });

    return NextResponse.json({
      success: true,
      message: 'החבילה עודכנה בהצלחה',
      newPackage,
    });
  } catch (error) {
    console.error('Update wedding package error:', error);
    return NextResponse.json(
      { error: 'Failed to update wedding package' },
      { status: 500 }
    );
  }
}
