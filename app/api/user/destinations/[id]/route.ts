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

interface UpdateDestinationRequest {
  notes?: string;
}

// GET /api/user/destinations/[id] - Get a specific saved destination
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

    const { data: destination, error } = await supabase
      .from('user_saved_destinations')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
      }
      console.error('Error fetching destination:', error);
      return NextResponse.json({ error: 'Failed to fetch destination' }, { status: 500 });
    }

    return NextResponse.json(destination);
  } catch (error) {
    console.error('Unexpected error in GET /api/user/destinations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/destinations/[id] - Update a specific saved destination
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

    const body: UpdateDestinationRequest = await request.json();
    
    // Build update object
    const updateData = {
      notes: body.notes,
      updated_at: new Date().toISOString(),
    };

    const { data: destination, error } = await supabase
      .from('user_saved_destinations')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
      }
      console.error('Error updating destination:', error);
      return NextResponse.json({ error: 'Failed to update destination' }, { status: 500 });
    }

    return NextResponse.json(destination);
  } catch (error) {
    console.error('Unexpected error in PUT /api/user/destinations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/destinations/[id] - Remove a specific saved destination
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
      .from('user_saved_destinations')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting destination:', error);
      return NextResponse.json({ error: 'Failed to delete destination' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/user/destinations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}