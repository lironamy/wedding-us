import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import PackagePricing from '@/lib/db/models/PackagePricing';

// Default pricing to seed if no pricing exists
const defaultPricing = [
  { guests: 200, price: 0, label: 'חינם' },
  { guests: 300, price: 149, label: '₪149' },
  { guests: 400, price: 199, label: '₪199' },
  { guests: 500, price: 249, label: '₪249' },
  { guests: 600, price: 299, label: '₪299' },
  { guests: 700, price: 349, label: '₪349' },
  { guests: 800, price: 399, label: '₪399' },
  { guests: 900, price: 449, label: '₪449' },
  { guests: 1000, price: 499, label: '₪499' },
];

// GET - Get all package pricing (public for users to see prices)
export async function GET() {
  try {
    await dbConnect();

    let pricing = await PackagePricing.find({ isActive: true }).sort({ guests: 1 }).lean();

    // If no pricing exists, seed with defaults
    if (pricing.length === 0) {
      await PackagePricing.insertMany(defaultPricing);
      pricing = await PackagePricing.find({ isActive: true }).sort({ guests: 1 }).lean();
    }

    return NextResponse.json({ pricing }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

// PUT - Update package pricing (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await request.json();
    const { pricing } = body;

    if (!pricing || !Array.isArray(pricing)) {
      return NextResponse.json({ error: 'Invalid pricing data' }, { status: 400 });
    }

    await dbConnect();

    // Update each pricing item
    for (const item of pricing) {
      await PackagePricing.findOneAndUpdate(
        { guests: item.guests },
        {
          price: item.price,
          label: item.price === 0 ? 'חינם' : `₪${item.price}`,
          isActive: item.isActive !== false
        },
        { upsert: true, new: true }
      );
    }

    const updatedPricing = await PackagePricing.find({ isActive: true }).sort({ guests: 1 }).lean();

    return NextResponse.json({
      success: true,
      message: 'המחירים עודכנו בהצלחה',
      pricing: updatedPricing
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
  }
}

// POST - Add new package tier (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await request.json();
    const { guests, price } = body;

    if (!guests || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Check if tier already exists
    const existing = await PackagePricing.findOne({ guests });
    if (existing) {
      return NextResponse.json({ error: 'חבילה עם מספר אורחים זה כבר קיימת' }, { status: 400 });
    }

    const newPricing = await PackagePricing.create({
      guests,
      price,
      label: price === 0 ? 'חינם' : `₪${price}`,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'החבילה נוספה בהצלחה',
      pricing: newPricing
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pricing:', error);
    return NextResponse.json({ error: 'Failed to create pricing' }, { status: 500 });
  }
}

// DELETE - Remove package tier (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const guests = searchParams.get('guests');

    if (!guests) {
      return NextResponse.json({ error: 'Missing guests parameter' }, { status: 400 });
    }

    await dbConnect();

    // Don't allow deleting the free tier
    if (parseInt(guests) === 200) {
      return NextResponse.json({ error: 'לא ניתן למחוק את החבילה החינמית' }, { status: 400 });
    }

    await PackagePricing.findOneAndDelete({ guests: parseInt(guests) });

    return NextResponse.json({
      success: true,
      message: 'החבילה נמחקה בהצלחה'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting pricing:', error);
    return NextResponse.json({ error: 'Failed to delete pricing' }, { status: 500 });
  }
}
