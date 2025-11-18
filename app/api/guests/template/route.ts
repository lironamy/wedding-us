import { NextResponse } from 'next/server';
import { generateGuestTemplate } from '@/lib/utils/excel';

// GET - Download Excel template
export async function GET() {
  try {
    const buffer = generateGuestTemplate();

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="guest-import-template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
