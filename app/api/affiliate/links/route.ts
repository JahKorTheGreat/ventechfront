import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, resolveAffiliateLinkOwnerColumn } from '../utils';

export async function GET(request: NextRequest) {
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

    // Get affiliate links for the user
    const { data: links, error: linksError } = await supabase
      .from('affiliate_links')
      .select('*, products (id, name, price)')
      .eq(ownerField, user.id)
      .order('created_at', { ascending: false });

    if (linksError) {
      console.error('Error fetching affiliate links:', linksError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch affiliate links' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedLinks = links.map(link => {
      const earningsValue = Number(link.earnings ?? link.commission ?? link.amount ?? 0);
      const clicksValue = Number(link.clicks ?? 0);
      const conversionsValue = Number(link.conversions ?? 0);

      return {
        id: link.id,
        productId: link.product_id || link.productId || '',
        code: link.code || link.referral_code || '',
        link: link.url || link.generated_url || '',
        clicks: clicksValue,
        conversions: conversionsValue,
        earnings: earningsValue,
      };
    });

    return NextResponse.json({
      links: transformedLinks
    });

  } catch (error) {
    console.error('Error in affiliate links fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch affiliate links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, source } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Link name is required' },
        { status: 400 }
      );
    }

    // Generate unique link code
    const linkCode = `AFF-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;

    const ownerField = await resolveAffiliateLinkOwnerColumn(supabase, user.id);
    if (!ownerField) {
      return NextResponse.json(
        { error: 'Database schema error', message: 'Affiliate link owner field not found' },
        { status: 500 }
      );
    }

    // Create affiliate link record
    const { data: linkData, error: linkError } = await supabase
      .from('affiliate_links')
      .insert({
        [ownerField]: user.id,
        code: linkCode,
        name: name,
        source: source || null,
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
        { error: 'Database error', message: 'Failed to create affiliate link' },
        { status: 500 }
      );
    }

    // Generate the affiliate URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const affiliateUrl = `${baseUrl}/?ref=${linkCode}`;

    // Update the URL in the database
    const { error: updateError } = await supabase
      .from('affiliate_links')
      .update({ url: affiliateUrl })
      .eq('id', linkData.id);

    if (updateError) {
      console.error('Error updating affiliate link URL:', updateError);
    }

    // Return the created link
    return NextResponse.json({
      success: true,
      data: {
        id: linkData.id,
        code: linkCode,
        name: linkData.name,
        url: affiliateUrl,
        source: linkData.source,
        clicks: 0,
        conversions: 0,
        earnings: 0,
        conversionRate: 0,
        createdAt: linkData.created_at,
        updatedAt: linkData.updated_at,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error in affiliate link creation:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to create affiliate link' },
      { status: 500 }
    );
  }
}