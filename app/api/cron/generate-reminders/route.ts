import { NextRequest, NextResponse } from 'next/server';
import { generateReminders } from '@/lib/reminder-processor';

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

// GET /api/cron/generate-reminders - Generate reminder records from configs
// This endpoint should be called daily at midnight
export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await generateReminders();

    return NextResponse.json({
      success: true,
      message: 'Reminders generated successfully',
      stats: {
        loans_processed: result.processed,
        errors_count: result.errors.length,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error('Failed to generate reminders:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
