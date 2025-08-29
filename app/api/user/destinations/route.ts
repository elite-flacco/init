import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Destination } from '../../../../src/types/travel';

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
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

interface CreateDestinationRequest {
  destination: Destination;
  notes?: string;
}

interface UpdateDestinationRequest {
  notes?: string;
}

// GET /api/user/destinations - Get user's saved destinations
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(request);

    // Fetch user's destinations
    const { data: destinations, error } = await supabase
      .from('user_saved_destinations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user destinations:', error);
      return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 });
    }

    return NextResponse.json(destinations || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/user/destinations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/destinations - Save a new destination
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(request);
    const body: CreateDestinationRequest = await request.json();
    
    // Validate required fields
    if (!body.destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    // Check if destination is already saved by this user
    const { data: existingDestination } = await supabase
      .from('user_saved_destinations')
      .select('id')
      .eq('user_id', user.id)
      .eq('destination->>name', body.destination.name)
      .eq('destination->>country', body.destination.country)
      .single();

    if (existingDestination) {
      return NextResponse.json({ error: 'Destination already saved' }, { status: 409 });
    }

    // Create the saved destination
    const { data: savedDestination, error } = await supabase
      .from('user_saved_destinations')
      .insert({
        user_id: user.id,
        destination: body.destination,
        notes: body.notes || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving destination:', error);
      return NextResponse.json({ error: 'Failed to save destination' }, { status: 500 });
    }

    return NextResponse.json(savedDestination);
  } catch (error) {
    console.error('Unexpected error in POST /api/user/destinations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}