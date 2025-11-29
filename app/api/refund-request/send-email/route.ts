import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { sendRefundRequestEmail, sendRefundConfirmationToCustomer } from '@/lib/email/smtp';

/**
 * POST /api/refund-request/send-email
 * Send refund request email to admin and confirmation to customer
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      weddingId,
      currentPackage,
      requestedPackage,
      paidAmount,
      refundAmount,
      reason,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !weddingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email to admin using SMTP
    const adminResult = await sendRefundRequestEmail({
      fullName,
      email,
      phone,
      weddingId,
      currentPackage,
      requestedPackage,
      paidAmount,
      refundAmount,
      reason,
    });

    if (!adminResult.success) {
      console.error('[RefundRequest] Failed to send admin email:', adminResult.message);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send confirmation email to customer (in background, don't fail if this fails)
    sendRefundConfirmationToCustomer({
      fullName,
      email,
      refundAmount,
    }).then(result => {
      if (result.success) {
        console.log(`[RefundRequest] Confirmation email sent to customer: ${email}`);
      } else {
        console.error(`[RefundRequest] Failed to send customer confirmation:`, result.message);
      }
    }).catch(err => {
      console.error(`[RefundRequest] Error sending customer confirmation:`, err);
    });

    console.log(`[RefundRequest] Email sent for wedding ${weddingId}, refund: ₪${refundAmount}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending refund request email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
