// Generate Affiliate Link API Route
// POST /api/affiliate/generate-link
// Creates a new affiliate link for a product

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, affiliateId } = body;

    // Basic validation
    if (!productId || !affiliateId) {
      return NextResponse.json(
        {
          success: false,
          message: 'productId and affiliateId are required'
        },
        { status: 400 }
      );
    }

    // Generate a unique code for the link
    const code = `AFF-${affiliateId.slice(0, 8)}-${productId.slice(0, 8)}-${Date.now().toString().slice(-6)}`;

    // Generate the affiliate link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${baseUrl}/shop/${productId}?ref=${code}`;

    console.log('🔗 Generated affiliate link:', {
      productId,
      affiliateId,
      code,
      link
    });

    return NextResponse.json({
      success: true,
      link,
      code,
      message: 'Affiliate link generated successfully'
    });

  } catch (error) {
    console.error('Error generating affiliate link:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate affiliate link'
      },
      { status: 500 }
    );
  }
}