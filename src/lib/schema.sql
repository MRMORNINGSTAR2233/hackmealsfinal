-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    mobile VARCHAR(50) NOT NULL UNIQUE,
    team_name VARCHAR(255) NOT NULL,
    qr_code VARCHAR(255) NOT NULL UNIQUE,
    breakfast BOOLEAN DEFAULT FALSE,
    lunch BOOLEAN DEFAULT FALSE,
    dinner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin
INSERT INTO admins (username, password) 
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_mobile ON participants(mobile);
CREATE INDEX IF NOT EXISTS idx_participants_qr_code ON participants(qr_code);
CREATE INDEX IF NOT EXISTS idx_participants_team_name ON participants(team_name);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for participants table
CREATE POLICY "Enable read access for all users" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON participants
    FOR UPDATE USING (true);

-- Create policies for admins table
CREATE POLICY "Enable read access for all users" ON admins
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON admins
    FOR INSERT WITH CHECK (true);