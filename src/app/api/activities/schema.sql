-- Create activity_types table
CREATE TABLE IF NOT EXISTS activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create participants (locations) table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    activity_type_id UUID NOT NULL REFERENCES activity_types(id),
    participant_id UUID NOT NULL REFERENCES participants(id),
    date DATE NOT NULL,
    duration INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert some initial activity types
INSERT INTO activity_types (name) VALUES 
    ('Skiing'),
    ('Snowboarding'),
    ('Cross-Country'),
    ('Backcountry')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample locations
INSERT INTO participants (name) VALUES 
    ('Whistler Blackcomb'),
    ('Cypress Mountain'),
    ('Mount Baker')
ON CONFLICT (name) DO NOTHING;