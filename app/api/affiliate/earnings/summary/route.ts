import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, resolveAffiliateLinkOwnerColumn } from '../../utils';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [EARNINGS SUMMARY API] GET /api/affiliate/earnings/summary');

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

    // Get all affiliate links for the user
    const { data: links, error: linksError } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq(ownerField, user.id);

    if (linksError) {
      console.error('❌ Error fetching links:', linksError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch earnings summary' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${links?.length || 0} affiliate links`);

    // Calculate summary statistics
    let totalEarnings = 0;
    let totalCommissions = 0;
    let pendingCommissions = 0;
    let approvedCommissions = 0;
    let paidCommissions = 0;
    let rejectedCommissions = 0;
    let monthlyEarnings = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    (links || []).forEach((link: any) => {
      const earnings = Number(link.earnings ?? link.commission ?? link.amount ?? 0);
      const conversions = Number(link.conversions ?? 0);
      
      totalEarnings += earnings;
      totalCommissions += earnings; // In this system, commissions equal earnings

      // Categorize by status
      switch (link.status) {
        case 'pending':
          pendingCommissions += earnings;
          break;
        case 'approved':
          approvedCommissions += earnings;
          break;
        case 'paid':
          paidCommissions += earnings;
          break;
        case 'rejected':
          rejectedCommissions += earnings;
          break;
      }

      // Calculate monthly earnings
      if (link.created_at) {
        const linkDate = new Date(link.created_at);
        if (linkDate.getMonth() === currentMonth && linkDate.getFullYear() === currentYear) {
          monthlyEarnings += earnings;
        }
      }
    });

    const summary = {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalCommissions: parseFloat(totalCommissions.toFixed(2)),
      pendingCommissions: parseFloat(pendingCommissions.toFixed(2)),
      approvedCommissions: parseFloat(approvedCommissions.toFixed(2)),
      paidCommissions: parseFloat(paidCommissions.toFixed(2)),
      rejectedCommissions: parseFloat(rejectedCommissions.toFixed(2)),
      monthlyEarnings: parseFloat(monthlyEarnings.toFixed(2)),
    };

    const response = {
      success: true,
      data: summary,
    };

    console.log('📤 [SUMMARY RESPONSE]', summary);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error in earnings summary endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch earnings summary' },
      { status: 500 }
    );
  }
}
