import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side auth
function createSupabaseServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper function to get user from auth header
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error ? null : user;
  } catch {
    return null;
  }
}

interface UpdatePlanRequest {
  name?: string;
  tags?: string[];
  is_favorite?: boolean;
}

// GET /api/user/plans/[id] - Get a specific plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from auth header
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create server client
    const supabase = createSupabaseServerClient(request);

    const { data: plan, error } = await supabase
      .from('user_travel_plans')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      console.error('Error fetching plan:', error);
      return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Unexpected error in GET /api/user/plans/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/plans/[id] - Update a specific plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from auth header
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create server client
    const supabase = createSupabaseServerClient(request);

    const body: UpdatePlanRequest = await request.json();
    
    // Build update object with only provided fields
    const updateData: Partial<UpdatePlanRequest> & { updated_at?: string } = {
      updated_at: new Date().toISOString(),
    };
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.is_favorite !== undefined) updateData.is_favorite = body.is_favorite;

    const { data: plan, error } = await supabase
      .from('user_travel_plans')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      console.error('Error updating plan:', error);
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Unexpected error in PUT /api/user/plans/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/plans/[id] - Delete a specific plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from auth header
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create server client
    const supabase = createSupabaseServerClient(request);

    const { error } = await supabase
      .from('user_travel_plans')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting plan:', error);
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/user/plans/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}