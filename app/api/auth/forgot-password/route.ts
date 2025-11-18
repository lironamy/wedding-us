import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { generateUUID } from '@/lib/utils';

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

    // In a real app, you would:
    // 1. Save resetToken and resetTokenExpiry to the user document
    // 2. Send email with reset link containing the token
    // For now, we'll just return a success message

    // TODO: Implement password reset token storage and email sending
    // The email should be sent from the client using EmailJS
    // You can create a client-side component to handle this

    return NextResponse.json(
      {
        message: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה',
        // For testing purposes only - remove in production
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      },
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
