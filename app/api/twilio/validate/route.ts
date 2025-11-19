import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { TwilioWhatsAppService } from '@/lib/services/twilio-whatsapp';

/**
 * POST /api/twilio/validate
 * Validate Twilio credentials
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountSid, authToken } = body;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    console.log('🔐 [API] Validating Twilio credentials...');

    const result = await TwilioWhatsAppService.validateCredentials(
      accountSid,
      authToken
    );

    if (result.valid) {
      return NextResponse.json({
        valid: true,
        message: 'Credentials are valid!',
      });
    } else {
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ [API] Validation error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to validate credentials',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
