import { neon } from "@neondatabase/serverless";

const NullishQueryFunction = () => {
  throw new Error(
    "No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set",
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    "No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set",
  );
};
const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : NullishQueryFunction;

// Helper functions to make SQL operations more efficient (like Supabase)
export const createResponse = (data, success = true, status = 200) => {
  return Response.json({ success, ...data }, { status });
};

export const handleError = (error, message = "Operation failed") => {
  console.error(`${message}:`, error);
  return createResponse(
    {
      error: message,
      details: error.message,
    },
    false,
    500,
  );
};

// Enhanced query builder for dynamic filtering
export const buildDynamicQuery = (baseQuery, filters = {}) => {
  let query = baseQuery;
  let params = [];
  let paramCount = 0;

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "All"
    ) {
      paramCount++;

      if (key === "search" && typeof value === "object" && value.fields) {
        // Handle search across multiple fields
        const searchConditions = value.fields
          .map((field) => `LOWER(${field}) LIKE LOWER($${paramCount})`)
          .join(" OR ");
        query += ` AND (${searchConditions})`;
        params.push(`%${value.term}%`);
      } else if (key.includes("_range") && typeof value === "object") {
        // Handle date/number ranges
        query += ` AND ${value.field} BETWEEN $${paramCount} AND $${paramCount + 1}`;
        params.push(value.from, value.to);
        paramCount++;
      } else {
        // Handle exact matches
        query += ` AND ${key} = $${paramCount}`;
        params.push(value);
      }
    }
  });

  return { query, params };
};

// Validation helpers
export const validateRequired = (data, requiredFields) => {
  const missingFields = requiredFields.filter(
    (field) =>
      !data[field] || (typeof data[field] === "string" && !data[field].trim()),
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
};

export const validateEnum = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    throw new Error(
      `Invalid ${fieldName}. Must be one of: ${allowedValues.join(", ")}`,
    );
  }
};

// Database operation helpers
export const insertRecord = async (table, data) => {
  const columns = Object.keys(data).join(", ");
  const placeholders = Object.keys(data)
    .map((_, i) => `$${i + 1}`)
    .join(", ");
  const values = Object.values(data);

  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await sql(query, values);
  return result[0];
};

export const updateRecord = async (table, id, data) => {
  const setClause = Object.keys(data)
    .map((key, i) => `${key} = $${i + 2}`)
    .join(", ");
  const values = [id, ...Object.values(data)];

  const query = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
  const result = await sql(query, values);
  return result[0];
};

export const deleteRecord = async (table, id) => {
  const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
  const result = await sql(query, [id]);
  return result[0];
};

export const findById = async (table, id) => {
  const query = `SELECT * FROM ${table} WHERE id = $1`;
  const result = await sql(query, [id]);
  return result[0];
};

export default sql;
