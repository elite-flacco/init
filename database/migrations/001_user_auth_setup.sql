-- Enable Row Level Security (RLS) on existing shared_plans table
ALTER TABLE shared_plans ENABLE ROW LEVEL SECURITY;

-- Add user_id column to existing shared_plans table
ALTER TABLE shared_plans 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create user_travel_plans table
CREATE TABLE user_travel_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    destination JSONB NOT NULL,
    traveler_type JSONB NOT NULL,
    ai_response JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_saved_destinations table
CREATE TABLE user_saved_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destination JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_travel_plans_user_id ON user_travel_plans(user_id);
CREATE INDEX idx_user_travel_plans_created_at ON user_travel_plans(created_at DESC);
CREATE INDEX idx_user_travel_plans_is_favorite ON user_travel_plans(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_user_saved_destinations_user_id ON user_saved_destinations(user_id);
CREATE INDEX idx_user_saved_destinations_created_at ON user_saved_destinations(created_at DESC);
CREATE INDEX idx_shared_plans_user_id ON shared_plans(user_id) WHERE user_id IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE user_travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_destinations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_travel_plans
CREATE POLICY "Users can view their own travel plans" ON user_travel_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel plans" ON user_travel_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel plans" ON user_travel_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel plans" ON user_travel_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_saved_destinations
CREATE POLICY "Users can view their own saved destinations" ON user_saved_destinations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved destinations" ON user_saved_destinations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved destinations" ON user_saved_destinations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved destinations" ON user_saved_destinations
    FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for shared_plans table
-- Allow all users to read shared plans (existing behavior)
CREATE POLICY "Anyone can view shared plans" ON shared_plans
    FOR SELECT USING (TRUE);

-- Allow anyone to create shared plans (existing behavior)
CREATE POLICY "Anyone can create shared plans" ON shared_plans
    FOR INSERT WITH CHECK (TRUE);

-- Allow users to update their own shared plans
CREATE POLICY "Users can update their own shared plans" ON shared_plans
    FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow users to delete their own shared plans
CREATE POLICY "Users can delete their own shared plans" ON shared_plans
    FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_user_travel_plans_updated_at BEFORE UPDATE ON user_travel_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_saved_destinations_updated_at BEFORE UPDATE ON user_saved_destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();