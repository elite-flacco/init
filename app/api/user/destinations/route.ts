import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../src/lib/supabase';
import { Destination } from '../../../../src/types/travel';

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
    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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