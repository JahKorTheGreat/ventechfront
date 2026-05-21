import { NextRequest } from 'next/server';

export const AFFILIATE_LINK_OWNER_FIELDS = [
  'user_id',
  'affiliate_id',
  'owner_id',
  'profile_id',
  'created_by',
  'author_id',
  'creator_id',
  'member_id',
  'account_id',
  'customer_id',
  'partner_id',
  'referrer_id',
  'affiliate_user_id',
] as const;

export type AffiliateLinkOwnerField = (typeof AFFILIATE_LINK_OWNER_FIELDS)[number];

export async function getAuthenticatedUser(supabase: any, request: NextRequest) {
  const cookieResult = await supabase.auth.getUser();
  if (cookieResult?.data?.user) {
    return cookieResult.data.user;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('Failed to authenticate bearer token:', error);
      return null;
    }
    return user;
  }

  return null;
}

export async function resolveAffiliateLinkOwnerColumn(
  supabase: any,
  userId: string
): Promise<AffiliateLinkOwnerField | null> {
  // Based on the track route, we know user_id exists, so try it first
  const { error: userIdError } = await supabase
    .from('affiliate_links')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (!userIdError) {
    console.log('✅ Using user_id as owner column');
    return 'user_id';
  }

  if (userIdError.code === '42703') {
    console.log('user_id column not found, trying other columns...');
  } else {
    console.error('Error testing user_id:', {
      code: userIdError.code,
      message: userIdError.message,
      details: userIdError.details,
      hint: userIdError.hint
    });
  }

  // If user_id doesn't work, try other columns
  for (const column of AFFILIATE_LINK_OWNER_FIELDS.filter(c => c !== 'user_id')) {
    const { error } = await supabase
      .from('affiliate_links')
      .select('id')
      .eq(column, userId)
      .limit(1);

    if (!error) {
      console.log(`✅ Found valid owner column: ${column}`);
      return column;
    }

    if (error.code !== '42703') {
      console.error(`Unexpected error testing column ${column}:`, {
        code: error.code,
        message: error.message
      });
    }
  }

  // If all else fails, default to user_id since track route uses it
  console.log('⚠️ Defaulting to user_id as owner column');
  return 'user_id';
}

export function extractAffiliateOwnerId(linkRow: Record<string, any>): string | null {
  if (!linkRow || typeof linkRow !== 'object') {
    return null;
  }

  for (const column of AFFILIATE_LINK_OWNER_FIELDS) {
    if (linkRow[column]) {
      return linkRow[column];
    }
  }

  return null;
}
