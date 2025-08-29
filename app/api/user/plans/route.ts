import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Destination, TravelerType } from '../../../../src/types/travel';
import { AITripPlanningResponse } from '../../../../src/services/aiTripPlanningService';

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

interface CreatePlanRequest {
  name: string;
  destination: Destination;
  travelerType: TravelerType;
  aiResponse: AITripPlanningResponse;
  tags?: string[];
  is_favorite?: boolean;
}

interface UpdatePlanRequest {
  name?: string;
  tags?: string[];
  is_favorite?: boolean;
}

// GET /api/user/plans - Get user's saved plans
export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create server client
    const supabase = createSupabaseServerClient(request);

    // Fetch user's plans
    const { data: plans, error } = await supabase
      .from('user_travel_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user plans:', error);
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }

    return NextResponse.json(plans || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/user/plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    // Get user from auth header
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreatePlanRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.destination || !body.travelerType || !body.aiResponse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create server client
    const supabase = createSupabaseServerClient(request);

    // Create the plan
    const { data: plan, error } = await supabase
      .from('user_travel_plans')
      .insert({
        user_id: user.id,
        name: body.name,
        destination: body.destination,
        traveler_type: body.travelerType,
        ai_response: body.aiResponse,
        tags: body.tags || [],
        is_favorite: body.is_favorite || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Unexpected error in POST /api/user/plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/plans/[id] would be in a separate file
// DELETE /api/user/plans/[id] would be in a separate file