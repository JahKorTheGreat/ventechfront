import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, resolveAffiliateLinkOwnerColumn } from '../utils';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [DASHBOARD STATS API] GET /api/affiliate/stats');

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

    // Get affiliate links and clicks data
    const { data: links, error: linksError } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq(ownerField, user.id);

    if (linksError) {
      console.error('❌ Error fetching links:', linksError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${links?.length || 0} affiliate links`);

    // Calculate statistics
    const stats = {
      totalEarnings: 0,
      monthlyEarnings: 0,
      totalCommissions: 0,
      totalClicks: 0,
      conversionRate: 0,
      activeLinks: 0,
      tier: 'Bronze', // Default tier
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalConversions = 0;

    (links || []).forEach((link: any) => {
      const earnings = Number(link.earnings ?? link.commission ?? link.amount ?? 0);
      const clicks = Number(link.clicks ?? 0);
      const conversions = Number(link.conversions ?? 0);

      stats.totalEarnings += earnings;
      stats.totalClicks += clicks;
      totalConversions += conversions;

      if (link.status === 'active') {
        stats.activeLinks += 1;
      }

      // For now, count all earnings as monthly (in production, filter by date)
      stats.monthlyEarnings += earnings;
    });

    stats.totalCommissions = stats.totalEarnings;

    // Calculate conversion rate
    if (stats.totalClicks > 0) {
      stats.conversionRate = parseFloat(((totalConversions / stats.totalClicks) * 100).toFixed(2));
    }

    // Determine tier based on earnings
    if (stats.totalEarnings >= 5000) {
      stats.tier = 'Platinum';
    } else if (stats.totalEarnings >= 2000) {
      stats.tier = 'Gold';
    } else if (stats.totalEarnings >= 500) {
      stats.tier = 'Silver';
    } else {
      stats.tier = 'Bronze';
    }

    const response = {
      success: true,
      data: stats,
    };

    console.log('📤 [STATS RESPONSE]', stats);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error in dashboard stats endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
