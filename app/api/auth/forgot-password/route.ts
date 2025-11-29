import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { generateUUID } from '@/lib/utils';
import { sendPasswordResetEmail } from '@/lib/email/smtp';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'אימייל הוא שדה חובה' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success even if user not found (security best practice)
    // Don't reveal whether email exists in the system
    if (!user) {
      return NextResponse.json(
        { message: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateUUID();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Build reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

    // Send password reset email via SMTP
    const emailResult = await sendPasswordResetEmail(
      email,
      user.name || email.split('@')[0],
      resetLink
    );

    if (!emailResult.success) {
      console.error('[ForgotPassword] Failed to send email:', emailResult.message);
      // Still return success to not reveal if email exists
    } else {
      console.log(`[ForgotPassword] Reset email sent to ${email}`);
    }

    return NextResponse.json(
      { message: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה. אנא נסה שוב.' },
      { status: 500 }
    );
  }
}
