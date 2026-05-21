import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

interface TrackRequest {
  referralCode: string;
  page: string;
  referrer?: string;
  userAgent?: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: TrackRequest = await request.json();
    const { referralCode, page, referrer, userAgent, timestamp } = body;

    if (!referralCode) {
      return NextResponse.json(
        { success: false, message: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Get server-side Supabase client
    const cookieStore = await cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    // Get client IP (if available)
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    // Check if referral code exists
    const { data: linkData, error: linkError } = await supabase
      .from('affiliate_links')
      .select('id, user_id, code, clicks')
      .eq('code', referralCode)
      .single();

    if (linkError || !linkData) {
      console.log(`Invalid referral code attempted: ${referralCode}`);
      return NextResponse.json(
        { success: false, message: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // Check if this IP/session has already been tracked recently (prevent spam)
    const recentTrackingKey = `track_${referralCode}_${clientIP}_${Math.floor(timestamp / (1000 * 60 * 5))}`; // 5-minute window

    // For now, we'll allow tracking but could implement caching here for rate limiting

    // Record the click/visit
    const { error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_link_id: linkData.id,
        user_id: linkData.user_id,
        referral_code: referralCode,
        page_visited: page,
        referrer: referrer || null,
        user_agent: userAgent || null,
        ip_address: clientIP,
        clicked_at: new Date(timestamp).toISOString(),
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

    if (clickError) {
      console.error('Error recording affiliate click:', clickError);
      return NextResponse.json(
        { success: false, message: 'Failed to record tracking data' },
        { status: 500 }
      );
    }

    // Update click count on the affiliate link
    const newClickCount = (linkData.clicks || 0) + 1;
    const { error: updateError } = await supabase
      .from('affiliate_links')
      .update({
        clicks: newClickCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkData.id);

    if (updateError) {
      console.error('Error updating click count:', updateError);
      // Don't fail the request for this, as the click was already recorded
    }

    console.log(`Affiliate click tracked: ${referralCode} on ${page}`);

    return NextResponse.json({
      success: true,
      message: 'Referral tracked successfully'
    });

  } catch (error) {
    console.error('Error in affiliate tracking:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}