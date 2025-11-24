import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'טוקן וסיסמה הם שדות חובה' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'הסיסמה חייבת להכיל לפחות 8 תווים' },
        { status: 400 }
      );
    }

    await dbConnect();

    console.log('Looking for token:', token);

    // First, find user just by token to debug
    const userByToken = await User.findOne({ resetToken: token });
    console.log('User found by token only:', userByToken ? 'Yes' : 'No');
    if (userByToken) {
      console.log('Token expiry:', userByToken.resetTokenExpiry);
      console.log('Current time:', new Date());
      console.log('Is expired:', userByToken.resetTokenExpiry < new Date());
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      // Check if token exists but expired
      if (userByToken) {
        return NextResponse.json(
          { error: 'פג תוקף הקישור לאיפוס הסיסמה. אנא בקש קישור חדש.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'הקישור לאיפוס הסיסמה אינו תקף' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'הסיסמה עודכנה בהצלחה' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה. אנא נסה שוב.' },
      { status: 500 }
    );
  }
}
