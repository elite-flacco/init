import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../src/lib/supabase';

interface UpdateDestinationRequest {
  notes?: string;
}

// GET /api/user/destinations/[id] - Get a specific saved destination
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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