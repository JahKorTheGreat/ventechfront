import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = getSupabaseServerClient(cookieStore);

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    const countQuery = supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (status) {
      countQuery.eq('status', status);
    }

    if (category) {
      countQuery.eq('category_id', category);
    }

    const [{ data: products, error: productsError }, { count: totalCount, error: countError }] = await Promise.all([
      query,
      countQuery,
    ]);

    if (productsError) {
      console.error('Error querying products:', productsError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch affiliate products', error: productsError.message },
        { status: 500 }
      );
    }

    if (countError) {
      console.error('Error counting products:', countError);
    }

    if (!products) {
      return NextResponse.json({ success: true, data: { products: [], total: 0 } });
    }

    const normalizedProducts = products.map((product: any) => ({
      id: String(product.id),
      name: String(product.name ?? 'Unnamed product'),
      description: String(product.description ?? ''),
      price: Number(product.price ?? 0),
      image: String(product.image ?? product.image_url ?? '/placeholders/product.png'),
      category: String(product.category_id ?? 'General'),
      commissionRate: 0,
      commission: 0,
      affiliate_link: undefined,
      status: String(product.status ?? (product.is_active ? 'active' : 'inactive')) as 'active' | 'inactive',
      createdAt: String(product.created_at ?? product.updated_at ?? ''),
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: normalizedProducts,
        total: typeof totalCount === 'number' ? totalCount : normalizedProducts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching affiliate products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch affiliate products', error: String(error) },
      { status: 500 }
    );
  }
}
