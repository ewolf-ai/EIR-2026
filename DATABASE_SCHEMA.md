# Supabase Database Schema for EIR 2026

## Setup Instructions

Execute the following SQL commands in your Supabase SQL Editor to create the necessary tables.

## Tables

### 1. users
Stores user authentication information and DNI.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  dni TEXT UNIQUE NOT NULL,
  eir_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for performance
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_dni ON users(dni);
CREATE INDEX idx_users_email ON users(email);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE 
  USING (auth.uid()::text = firebase_uid);
```

### 2. preferences
Stores user preferences for hospitals, provinces, or autonomous communities.

```sql
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('hospital', 'province', 'community')),
  preference_value TEXT NOT NULL,
  priority INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, priority)
);

-- Add indexes
CREATE INDEX idx_preferences_user_id ON preferences(user_id);
CREATE INDEX idx_preferences_type ON preferences(preference_type);

-- Enable RLS
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies  
CREATE POLICY "Users can manage their own preferences" 
  ON preferences FOR ALL 
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text));
```

### 3. offered_positions
Stores all available EIR positions.

```sql
CREATE TABLE offered_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locality TEXT NOT NULL,
  province TEXT NOT NULL,
  center TEXT NOT NULL,
  specialty TEXT NOT NULL,
  num_positions INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for searching
CREATE INDEX idx_offered_positions_province ON offered_positions(province);
CREATE INDEX idx_offered_positions_locality ON offered_positions(locality);
CREATE INDEX idx_offered_positions_center ON offered_positions(center);
CREATE INDEX idx_offered_positions_specialty ON offered_positions(specialty);

-- Enable RLS (Read-only for all authenticated users)
ALTER TABLE offered_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view offered positions" 
  ON offered_positions FOR SELECT 
  TO authenticated
  USING (true);
```

### 4. autonomous_communities
Mapping table for provinces to autonomous communities.

```sql
CREATE TABLE autonomous_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province TEXT UNIQUE NOT NULL,
  community TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add index
CREATE INDEX idx_autonomous_communities_province ON autonomous_communities(province);

-- Enable RLS
ALTER TABLE autonomous_communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view communities" 
  ON autonomous_communities FOR SELECT 
  TO authenticated
  USING (true);
```

## Functions

### Update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Initial Data Population

After creating the tables, you'll need to:
1. Import offered_positions data from the provided Excel data
2. Populate autonomous_communities mapping table

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- offered_positions and autonomous_communities are read-only
- Use Supabase service role key only on server-side operations
- Never expose service role key to client
