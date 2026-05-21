import { NextRequest, NextResponse } from 'next/server';

// Mock campaigns data - in production this would come from a database
const mockCampaigns = [
  {
    id: 'camp-1',
    name: 'Summer Electronics Sale',
    description: 'Promote top electronics with bonus commissions during summer.',
    products: [
      {
        id: 'prod-1',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation.',
        price: 199.99,
        image: '/placeholders/product.png',
        category: 'Electronics',
        commissionRate: 10,
        commission: 19.99,
        affiliate_link: 'https://example.com/affiliate/prod-1',
        status: 'active',
        createdAt: '2023-01-01T00:00:00Z',
      }
    ],
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-08-31T23:59:59Z',
    commissionBonus: 5,
    status: 'active',
    imageUrl: '/banners/summer.jpg',
  },
  {
    id: 'camp-2',
    name: 'Back to School Accessories',
    description: 'Affiliate campaign for school supplies and accessories.',
    products: [
      {
        id: 'prod-2',
        name: 'Smartphone Case',
        description: 'Durable case for smartphones.',
        price: 29.99,
        image: '/placeholders/product.png',
        category: 'Accessories',
        commissionRate: 8,
        commission: 2.40,
        affiliate_link: 'https://example.com/affiliate/prod-2',
        status: 'active',
        createdAt: '2023-01-02T00:00:00Z',
      }
    ],
    startDate: '2023-08-01T00:00:00Z',
    endDate: '2023-09-30T23:59:59Z',
    commissionBonus: 3,
    status: 'upcoming',
    imageUrl: '/banners/back-to-school.jpg',
  },
  {
    id: 'camp-3',
    name: 'Holiday Gadgets',
    description: 'Winter holiday promotions for gadgets.',
    products: [],
    startDate: '2023-11-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    status: 'inactive',
    imageUrl: '/banners/holiday.jpg',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'inactive' | 'upcoming' | null;

    let filteredCampaigns = mockCampaigns;
    if (status) {
      filteredCampaigns = mockCampaigns.filter((campaign) => campaign.status === status);
    }

    return NextResponse.json(filteredCampaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}