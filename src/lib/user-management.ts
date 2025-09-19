import { query } from "@/lib/db";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operator';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  phone?: string;
  aadhaar_number?: string;
  balance?: number;
  is_blocked?: boolean;
  createdAt: string;
  updatedAt: string;
  created_by?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'supervisor' | 'operator';
  phone?: string;
  aadhaar_number?: string;
  createdBy: string; // ID of admin creating the user
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'supervisor' | 'operator';
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  phone?: string;
  aadhaar_number?: string;
}

// Get all users with pagination and filtering
export async function getUsers(
  page: number = 1,
  limit: number = 10,
  filters?: {
    role?: string;
    status?: string;
    search?: string;
  }
): Promise<{ users: User[]; total: number }> {
  let whereClause = "WHERE 1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.role) {
    whereClause += ` AND role = $${paramIndex}`;
    params.push(filters.role);
    paramIndex++;
  }

  if (filters?.status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters?.search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR aadhaar_number ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const offset = (page - 1) * limit;

  // Get users
  const usersQuery = `
    SELECT
      id,
      name,
      email,
      role,
      status,
      phone,
      aadhaar_number,
      balance,
      is_blocked,
      "createdAt",
      "updatedAt",
      created_by
    FROM "user"
    ${whereClause}
    ORDER BY "createdAt" DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const usersResult = await query(usersQuery, [...params, limit, offset]);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM "user"
    ${whereClause}
  `;

  const countResult = await query(countQuery, params);

  return {
    users: usersResult.rows,
    total: parseInt(countResult.rows[0].total)
  };
}

// Get a single user by ID
export async function getUserById(id: string): Promise<User | null> {
  const result = await query(
    `SELECT
      id, name, email, role, status, phone, aadhaar_number,
      balance, is_blocked, "createdAt", "updatedAt", created_by
     FROM "user" WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT
      id, name, email, role, status, phone, aadhaar_number,
      balance, is_blocked, "createdAt", "updatedAt", created_by
     FROM "user" WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

// Create new user (admin only)
export async function createUser(data: CreateUserRequest): Promise<User> {
  const result = await query(
    `INSERT INTO "user" (name, email, role, status, phone, aadhaar_number, created_by)
     VALUES ($1, $2, $3, 'active', $4, $5, $6)
     RETURNING
       id, name, email, role, status, phone, aadhaar_number,
       balance, is_blocked, "createdAt", "updatedAt", created_by`,
    [
      data.name,
      data.email,
      data.role,
      data.phone || null,
      data.aadhaar_number || null,
      data.createdBy
    ]
  );

  return result.rows[0];
}

// Update user
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User | null> {
  const setClause: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    setClause.push(`name = $${paramIndex}`);
    params.push(data.name);
    paramIndex++;
  }

  if (data.email !== undefined) {
    setClause.push(`email = $${paramIndex}`);
    params.push(data.email);
    paramIndex++;
  }

  if (data.role !== undefined) {
    setClause.push(`role = $${paramIndex}`);
    params.push(data.role);
    paramIndex++;
  }

  if (data.status !== undefined) {
    setClause.push(`status = $${paramIndex}`);
    params.push(data.status);
    paramIndex++;
  }

  if (data.phone !== undefined) {
    setClause.push(`phone = $${paramIndex}`);
    params.push(data.phone);
    paramIndex++;
  }

  if (data.aadhaar_number !== undefined) {
    setClause.push(`aadhaar_number = $${paramIndex}`);
    params.push(data.aadhaar_number);
    paramIndex++;
  }

  if (setClause.length === 0) {
    return await getUserById(id);
  }

  setClause.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const result = await query(
    `UPDATE "user"
     SET ${setClause.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING
       id, name, email, role, status, phone, aadhaar_number,
       balance, is_blocked, "createdAt", "updatedAt", created_by`,
    params
  );

  return result.rows[0] || null;
}

// Delete user (admin only)
export async function deleteUser(id: string): Promise<boolean> {
  const result = await query('DELETE FROM "user" WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}

// Check if user has permission to perform action
export async function hasPermission(
  userId: string,
  requiredRole: 'admin' | 'supervisor' | 'operator'
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user || user.status !== 'active') return false;

  const roleHierarchy = {
    admin: 3,
    supervisor: 2,
    operator: 1
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// Get user statistics for admin dashboard
export async function getUserStats(): Promise<{
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byRole: {
    admin: number;
    supervisor: number;
    operator: number;
  };
}> {
  const result = await query(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
      COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
      COUNT(CASE WHEN role = 'supervisor' THEN 1 END) as supervisor_count,
      COUNT(CASE WHEN role = 'operator' THEN 1 END) as operator_count
    FROM "user"
  `);

  const row = result.rows[0];
  return {
    total: parseInt(row.total),
    active: parseInt(row.active),
    pending: parseInt(row.pending),
    suspended: parseInt(row.suspended),
    byRole: {
      admin: parseInt(row.admin_count),
      supervisor: parseInt(row.supervisor_count),
      operator: parseInt(row.operator_count)
    }
  };
}