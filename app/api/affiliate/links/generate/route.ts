import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, resolveAffiliateLinkOwnerColumn } from '../../utils';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const user = await getAuthenticatedUser(supabase, request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const ownerField = await resolveAffiliateLinkOwnerColumn(supabase, user.id);
    if (!ownerField) {
      return NextResponse.json(
        { error: 'Database schema error', message: 'Affiliate link owner field not found' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { productId, name } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Generate unique link code
    const linkCode = `AFF-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;

    // Create affiliate link record
    const { data: linkData, error: linkError } = await supabase
      .from('affiliate_links')
      .insert({
        [ownerField]: user.id,
        product_id: productId,
        code: linkCode,
        name: name || `Link for product ${productId}`,
        status: 'active',
        clicks: 0,
        conversions: 0,
        earnings: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (linkError) {
      console.error('Error creating affiliate link:', linkError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to create affiliate link',
          details: linkError.message || linkError.details || null,
        },
        { status: 500 }
      );
    }

    console.log('✅ Affiliate link created in database:', linkData);

    // Generate the affiliate URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const affiliateUrl = `${baseUrl}/shop/product/${productId}?ref=${linkCode}`;

    console.log('🔗 Generated affiliate URL:', affiliateUrl);

    // Update the URL in the database
    const { error: updateError } = await supabase
      .from('affiliate_links')
      .update({ url: affiliateUrl })
      .eq('id', linkData.id);

    if (updateError) {
      console.error('Error updating affiliate link URL:', updateError);
      // Don't fail the request, just log the error
    }

    const responsePayload = {
      id: linkData.id,
      generated_url: affiliateUrl,
      url: affiliateUrl,
      referral_code: linkCode,
      code: linkCode,
      createdAt: linkData.created_at,
    };

    console.log('📤 API Response payload:', responsePayload);

    // Return the generated link
    return NextResponse.json({
      success: true,
      data: responsePayload,
    });

  } catch (error: any) {
    console.error('Error in affiliate link generation:', error);
    const message = error?.message || 'Failed to generate affiliate link';
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message,
        details: error?.stack || null,
      },
      { status: 500 }
    );
  }
}