import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Users
export async function getUserByAuth0Id(auth0Id: string) {
  const result = await pool.query('SELECT * FROM users WHERE auth0_id = $1', [auth0Id]);
  return result.rows[0] || null;
}

export async function createUser(auth0Id: string, email: string, name: string) {
  const result = await pool.query(
    'INSERT INTO users (auth0_id, email, name) VALUES ($1, $2, $3) RETURNING *',
    [auth0Id, email, name]
  );
  return result.rows[0];
}

export async function updateUser(id: string, fields: { name?: string; language?: string }) {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (fields.name !== undefined) {
    setClauses.push(`name = $${idx++}`);
    values.push(fields.name);
  }
  if (fields.language !== undefined) {
    setClauses.push(`language = $${idx++}`);
    values.push(fields.language);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

// Family members
export async function getFamilyMembers(userId: string) {
  const result = await pool.query('SELECT * FROM family_members WHERE user_id = $1', [userId]);
  return result.rows;
}

export async function createFamilyMember(
  userId: string,
  name: string,
  dob?: string,
  relation?: string,
  notes?: string
) {
  const result = await pool.query(
    'INSERT INTO family_members (user_id, name, dob, relation, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, name, dob || null, relation || null, notes || null]
  );
  return result.rows[0];
}

export async function deleteFamilyMember(id: string, userId: string) {
  await pool.query('DELETE FROM family_members WHERE id = $1 AND user_id = $2', [id, userId]);
}

// Triage sessions
export async function createTriageSession(session: {
  userId: string;
  memberId?: string;
  vitals: object;
  symptoms: object;
  riskLevel: string;
  recommendation: string;
  explanation: string;
  city: string;
  waitTimeEst?: string;
}) {
  const result = await pool.query(
    `INSERT INTO triage_sessions (user_id, member_id, vitals, symptoms, risk_level, recommendation, explanation, city, wait_time_est)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      session.userId,
      session.memberId || null,
      JSON.stringify(session.vitals),
      JSON.stringify(session.symptoms),
      session.riskLevel,
      session.recommendation,
      session.explanation,
      session.city,
      session.waitTimeEst || null,
    ]
  );
  return result.rows[0];
}

export async function getTriageHistory(userId: string) {
  const result = await pool.query(
    'SELECT * FROM triage_sessions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

// Bookings
export async function createBooking(
  userId: string,
  clinicName: string,
  clinicAddress: string,
  bookedAt: string
) {
  const result = await pool.query(
    'INSERT INTO bookings (user_id, clinic_name, clinic_address, booked_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, clinicName, clinicAddress, bookedAt]
  );
  return result.rows[0];
}

export default pool;
