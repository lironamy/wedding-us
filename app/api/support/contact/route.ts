import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { sendSupportEmail, sendSupportConfirmationToCustomer } from '@/lib/email/smtp';

/**
 * POST /api/support/contact
 * Send a support email from a logged-in user and confirmation to customer
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await dbConnect();

    // Get user's wedding info for context
    const wedding = await Wedding.findOne({ userId: session.user.id }).lean() as any;

    const userEmail = session.user.email || '';
    const userName = session.user.name || 'משתמש';
    const finalSubject = subject?.trim() || 'פנייה מהמערכת';
    const weddingInfo = wedding
      ? `${wedding.groomName} & ${wedding.brideName} (${wedding.uniqueUrl})`
      : undefined;

    // Send email to support using SMTP
    const result = await sendSupportEmail(
      userEmail,
      userName,
      finalSubject,
      message,
      weddingInfo
    );

    if (!result.success) {
      console.error('[Support] Failed to send email:', result.message);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Send confirmation email to customer (in background, don't fail if this fails)
    if (userEmail) {
      sendSupportConfirmationToCustomer({
        name: userName,
        email: userEmail,
        subject: finalSubject,
      }).then(confirmResult => {
        if (confirmResult.success) {
          console.log(`[Support] Confirmation email sent to customer: ${userEmail}`);
        } else {
          console.error(`[Support] Failed to send customer confirmation:`, confirmResult.message);
        }
      }).catch(err => {
        console.error(`[Support] Error sending customer confirmation:`, err);
      });
    }

    console.log(`[Support] Email sent successfully from ${userEmail}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending support email:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
