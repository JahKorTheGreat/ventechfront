// Affiliate Payouts API Route
// GET /api/affiliate/payouts
// Returns payout history for the authenticated affiliate

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock payouts data
    const payouts = [
      {
        id: 'payout-1',
        amount: 250.00,
        date: '2024-05-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: 'payout-2',
        amount: 180.50,
        date: '2024-05-01T14:20:00Z',
        status: 'processing'
      },
      {
        id: 'payout-3',
        amount: 320.75,
        date: '2024-04-15T09:15:00Z',
        status: 'completed'
      },
      {
        id: 'payout-4',
        amount: 95.25,
        date: '2024-04-01T16:45:00Z',
        status: 'pending'
      }
    ];

    console.log('💸 Returning payouts:', payouts);

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { payouts: [] },
      { status: 500 }
    );
  }
}