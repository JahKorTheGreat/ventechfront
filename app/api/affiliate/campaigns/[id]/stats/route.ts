import { NextRequest, NextResponse } from 'next/server';

// Mock campaign stats data
const mockCampaignStats = [
  {
    campaignId: 'camp-1',
    clicks: 1500,
    conversions: 75,
    earnings: 1500.00,
    products: [
      { productId: 'prod-1', clicks: 1000, conversions: 50, earnings: 1000.00 },
    ],
  },
  {
    campaignId: 'camp-2',
    clicks: 800,
    conversions: 40,
    earnings: 960.00,
    products: [
      { productId: 'prod-2', clicks: 800, conversions: 40, earnings: 960.00 },
    ],
  },
  {
    campaignId: 'camp-3',
    clicks: 2000,
    conversions: 100,
    earnings: 2000.00,
    products: [],
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stats = mockCampaignStats.find((s) => s.campaignId === id);

    if (!stats) {
      return NextResponse.json({ error: 'Campaign stats not found' }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}