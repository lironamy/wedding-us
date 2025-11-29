import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';

// Support email address
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@lunsoul.com';

/**
 * POST /api/support/contact
 * Send a support email from a logged-in user
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

    // Prepare email content
    const emailSubject = subject?.trim() || 'פנייה מהמערכת';
    const userEmail = session.user.email;
    const userName = session.user.name;
    const weddingInfo = wedding
      ? `${wedding.groomName} & ${wedding.brideName} (${wedding.uniqueUrl})`
      : 'לא נמצא אירוע';

    const emailBody = `
פנייה חדשה מהמערכת
==================

מאת: ${userName} (${userEmail})
אירוע: ${weddingInfo}
נושא: ${emailSubject}

הודעה:
${message}

==================
נשלח מדף העזרה בדשבורד
    `.trim();

    // Send email using your email service
    // For now, we'll use a simple approach with fetch to an email API
    // You can replace this with your preferred email service (SendGrid, Mailgun, etc.)

    // Option 1: If you have SendGrid configured
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (sendGridApiKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: SUPPORT_EMAIL }] }],
          from: { email: 'noreply@lunsoul.com', name: 'LunSoul Support' },
          reply_to: { email: userEmail, name: userName },
          subject: `[תמיכה] ${emailSubject} - ${userName}`,
          content: [{ type: 'text/plain', value: emailBody }],
        }),
      });

      if (!response.ok) {
        console.error('SendGrid error:', await response.text());
        throw new Error('Failed to send email via SendGrid');
      }

      console.log(`[Support] Email sent to ${SUPPORT_EMAIL} from ${userEmail}`);
      return NextResponse.json({ success: true });
    }

    // Option 2: Log the support request (fallback if no email service)
    console.log('=== SUPPORT REQUEST ===');
    console.log('From:', userName, userEmail);
    console.log('Wedding:', weddingInfo);
    console.log('Subject:', emailSubject);
    console.log('Message:', message);
    console.log('========================');

    // In development or if no email service, just log and return success
    // In production, you should configure an email service
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending support email:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
