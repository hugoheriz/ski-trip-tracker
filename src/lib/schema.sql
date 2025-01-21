-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create participants table (for people who can be spotted doing activities)
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spotter_id UUID REFERENCES users(id) NOT NULL,
    participant_id UUID REFERENCES participants(id) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_types enum table for valid activities
CREATE TABLE IF NOT EXISTS activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default activity types
INSERT INTO activity_types (name, description, points) VALUES
    ('fall', 'Fall down while skiing', 1),
    ('jump', 'Hit a jump', 2),
    ('blackDiamond', 'Complete a black diamond run', 3),
    ('firstChair', 'First one on the chairlift', 2),
    ('wipeout', 'Epic wipeout', 2),
    ('lodge', 'First at the lodge', 1)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_spotter ON activities(spotter_id);
CREATE INDEX IF NOT EXISTS idx_activities_participant ON activities(participant_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON participants(user_id);