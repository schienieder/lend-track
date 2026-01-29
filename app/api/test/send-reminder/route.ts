import { NextResponse } from 'next/server';
import { sendReminder } from '@/lib/email/send-reminder';

// Test endpoint to verify email sending functionality
// GET /api/test/send-reminder?email=<email>&type=<due_date|overdue|custom>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const email = searchParams.get('email') || 'justinerheitorres@gmail.com';
  const reminderType = (searchParams.get('type') as 'due_date' | 'overdue' | 'custom') || 'due_date';

  // Sample loan data for testing
  const currency = (searchParams.get('currency') as 'PHP' | 'USD') || 'PHP';
  const testData = {
    reminderType,
    borrowerEmail: email,
    borrowerName: 'Test Borrower',
    lenderName: 'Test Lender',
    principalAmount: 5000,
    interestRate: 5,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    currency,
    daysUntilDue: reminderType === 'due_date' ? 3 : undefined,
    daysOverdue: reminderType === 'overdue' ? 5 : undefined,
    customMessage: reminderType === 'custom' ? 'This is a test custom reminder message from LendTrack.' : undefined,
  };

  try {
    const result = await sendReminder(testData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test ${reminderType} reminder email sent successfully!`,
        recipient: email,
        messageId: result.messageId,
        testData: {
          borrowerName: testData.borrowerName,
          lenderName: testData.lenderName,
          principalAmount: testData.principalAmount,
          interestRate: testData.interestRate,
          dueDate: testData.dueDate,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send test email',
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test reminder error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error sending test email',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
