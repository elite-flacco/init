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

// GET /api/user/plans/list - Get user's saved plans (lightweight list without ai_response)
export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create server client
    const supabase = createSupabaseServerClient(request);

    // Fetch user's plans (excluding large ai_response for faster loading)
    const { data: plans, error } = await supabase
      .from('user_travel_plans')
      .select('id, name, destination, created_at, updated_at, tags, is_favorite')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user plans list:', error);
      return NextResponse.json({ error: 'Failed to fetch plans list' }, { status: 500 });
    }

    return NextResponse.json(plans || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/user/plans/list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}