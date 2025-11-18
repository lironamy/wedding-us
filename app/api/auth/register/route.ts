import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'כל השדות הם חובה' },
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'משתמש עם אימייל זה כבר קיים' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if this should be a super admin
    const isSuperAdmin = email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL?.toLowerCase();

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: isSuperAdmin ? 'admin' : 'couple',
    });

    return NextResponse.json(
      {
        message: 'המשתמש נוצר בהצלחה',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה בהרשמה. אנא נסה שוב.' },
      { status: 500 }
    );
  }
}
