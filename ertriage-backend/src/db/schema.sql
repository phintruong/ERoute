-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id    TEXT UNIQUE NOT NULL,
  email       TEXT,
  name        TEXT,
  language    TEXT DEFAULT 'en',
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Family members linked to a user
CREATE TABLE family_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  dob         DATE,
  relation    TEXT,
  notes       TEXT
);

-- Triage sessions
CREATE TABLE triage_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  member_id     UUID REFERENCES family_members(id),
  vitals        JSONB,
  symptoms      JSONB,
  risk_level    TEXT,
  recommendation TEXT,
  explanation   TEXT,
  city          TEXT,
  wait_time_est TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Clinic bookings
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  clinic_name     TEXT,
  clinic_address  TEXT,
  booked_at       TIMESTAMP,
  status          TEXT DEFAULT 'pending'
);
