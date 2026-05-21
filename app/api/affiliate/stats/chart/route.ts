import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, resolveAffiliateLinkOwnerColumn } from '../../utils';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [CHART DATA API] GET /api/affiliate/stats/chart');

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

    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get('timeframe') || 'month') as 'week' | 'month' | 'year';

    const now = new Date();
    const points: Array<{ date: string; earnings: number; clicks: number }> = [];

    if (timeframe === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        points.push({ date: date.toISOString().slice(0, 10), earnings: 0, clicks: 0 });
      }
    } else if (timeframe === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        points.push({ date: date.toISOString().slice(0, 10), earnings: 0, clicks: 0 });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        points.push({ date: date.toISOString().slice(0, 10), earnings: 0, clicks: 0 });
      }
    }

    const { data: links, error: linksError } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq(ownerField, user.id);

    if (linksError) {
      console.error('❌ Error fetching affiliate links for chart data:', linksError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch chart data' },
        { status: 500 }
      );
    }

    const chartData = (links || []).map((link: any) => {
      const earnings = Number(link.earnings ?? link.commission ?? link.amount ?? 0);
      const clicks = Number(link.clicks ?? 0);
      const createdAt = link.created_at || link.createdAt || null;
      return { earnings, clicks, createdAt };
    });

    chartData.forEach((record) => {
      const recordDate = record.createdAt ? new Date(record.createdAt).toISOString().slice(0, 10) : null;
      if (!recordDate) return;

      const match = points.find(point => point.date === recordDate);
      if (match) {
        match.earnings += record.earnings;
        match.clicks += record.clicks;
      }
    });

    return NextResponse.json({ success: true, data: points });
  } catch (error) {
    console.error('❌ Error in stats chart endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
