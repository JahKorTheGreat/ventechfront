// Affiliate Dashboard Chart Data API Route
// GET /api/affiliate/dashboard/chart
// Returns chart data for the authenticated affiliate

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    // Mock data based on timeframe
    let labels: string[];
    let earnings: number[];
    let clicks: number[];
    let conversions: number[];

    if (timeframe === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      earnings = [45.50, 67.25, 23.75, 89.00, 34.50, 78.25, 56.75];
      clicks = [120, 145, 98, 167, 134, 189, 156];
      conversions = [3, 4, 2, 6, 3, 5, 4];
    } else if (timeframe === 'year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      earnings = [450, 520, 480, 610, 580, 720, 690, 750, 680, 820, 780, 850];
      clicks = [1200, 1350, 1180, 1450, 1320, 1680, 1520, 1750, 1480, 1820, 1650, 1900];
      conversions = [25, 28, 24, 32, 29, 38, 35, 40, 34, 42, 39, 45];
    } else {
      // month - last 30 days
      labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
      earnings = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 20);
      clicks = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 50);
      conversions = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 1);
    }

    const chartData = {
      labels,
      earnings,
      clicks,
      conversions
    };

    console.log(`📈 Returning chart data for ${timeframe}:`, chartData);

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      {
        labels: [],
        earnings: [],
        clicks: [],
        conversions: []
      },
      { status: 500 }
    );
  }
}