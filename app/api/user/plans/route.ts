import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../src/lib/supabase';
import { authService } from '../../../../src/lib/auth';
import { Destination, TravelerType } from '../../../../src/types/travel';
import { AITripPlanningResponse } from '../../../../src/services/aiTripPlanningService';

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreatePlanRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.destination || !body.travelerType || !body.aiResponse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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