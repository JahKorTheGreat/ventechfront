// Affiliate Referrals API Route
// GET /api/affiliate/referrals
// Returns referrals for the authenticated affiliate

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock referrals data
    const referrals = [
      {
        id: 'ref-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        date: '2024-05-15T10:30:00Z',
        status: 'active'
      },
      {
        id: 'ref-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        date: '2024-05-14T14:20:00Z',
        status: 'pending'
      },
      {
        id: 'ref-3',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        date: '2024-05-13T09:15:00Z',
        status: 'active'
      },
      {
        id: 'ref-4',
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        date: '2024-05-12T16:45:00Z',
        status: 'inactive'
      }
    ];

    console.log('👥 Returning referrals:', referrals);

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { referrals: [] },
      { status: 500 }
    );
  }
}