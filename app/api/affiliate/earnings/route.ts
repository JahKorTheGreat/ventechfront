import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, resolveAffiliateLinkOwnerColumn } from '../utils';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [EARNINGS API] GET /api/affiliate/earnings');

    const cookieStore = await cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const user = await getAuthenticatedUser(supabase, request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`✅ User authenticated: ${user.id}`);

    const ownerField = await resolveAffiliateLinkOwnerColumn(supabase, user.id);
    if (!ownerField) {
      return NextResponse.json(
        { error: 'Database schema error', message: 'Affiliate link owner field not found' },
        { status: 500 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('📋 [QUERY PARAMS]', { status, page, limit, sortBy, sortOrder });

    const offset = (page - 1) * limit;

    // Get affiliate links with their associated order data
    let query = supabase
      .from('affiliate_links')
      .select('*')
      .eq(ownerField, user.id);

    // Apply status filter if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    if (sortBy === 'amount') {
      query = query.order('earnings', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order(sortBy === 'status' ? 'status' : 'created_at', { ascending: sortOrder === 'asc' });
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('affiliate_links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: links, error: linksError } = await query;

    if (linksError) {
      console.error('❌ Error fetching earnings:', linksError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch earnings' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${links?.length || 0} earnings records`);

    // Transform links to earnings format
    const earnings = (links || []).map((link: any) => {
      const amountValue = Number(link.earnings ?? link.commission ?? link.amount ?? 0);

      return {
        id: link.id,
        amount: amountValue,
        date: link.created_at || link.createdAt || new Date().toISOString(),
        status: link.status || 'approved',
      };
    });

    const response = {
      earnings,
    };

    console.log('📤 [API RESPONSE]', {
      earningsCount: earnings.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error in earnings endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
