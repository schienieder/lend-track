import { NextRequest, NextResponse } from 'next/server';
import { processReminders } from '@/lib/reminder-processor';

// Verify the cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET is not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron/process-reminders - Send pending reminder emails
// This endpoint should be called daily at 8 AM
export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processReminders();

    return NextResponse.json({
      success: true,
      message: 'Reminders processed successfully',
      stats: {
        reminders_processed: result.processed,
        emails_sent: result.sent,
        emails_failed: result.failed,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error('Failed to process reminders:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
