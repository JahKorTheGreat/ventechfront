// Affiliate Dashboard Stats API Route
// GET /api/affiliate/dashboard/stats
// Returns dashboard statistics for the authenticated affiliate

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - in production, this would fetch from database
    const stats = {
      totalEarnings: 1250.75,
      totalClicks: 3456,
      totalConversions: 89,
      totalReferrals: 23
    };

    console.log('📊 Returning dashboard stats:', stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        totalEarnings: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalReferrals: 0
      },
      { status: 500 }
    );
  }
}