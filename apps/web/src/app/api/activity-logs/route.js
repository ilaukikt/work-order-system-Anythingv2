import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const entityType = searchParams.get("entity_type");
    const activityType = searchParams.get("activity_type");

    const offset = (page - 1) * limit;

    // Build dynamic query
    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 0;

    if (entityType) {
      paramCount++;
      whereClause += ` AND entity_type = $${paramCount}`;
      params.push(entityType);
    }

    if (activityType) {
      paramCount++;
      whereClause += ` AND activity_type = $${paramCount}`;
      params.push(activityType);
    }

    // Add pagination params
    paramCount++;
    const limitParam = paramCount;
    params.push(limit);

    paramCount++;
    const offsetParam = paramCount;
    params.push(offset);

    const query = `
      SELECT 
        id,
        activity_type,
        entity_type,
        entity_id,
        description,
        details,
        user_name,
        user_email,
        created_at
      FROM activity_logs 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const activityLogs = await sql(query, params);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM activity_logs ${whereClause}`;
    const countParams = params.slice(0, -2); // Remove limit and offset params
    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return Response.json({
      activityLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return Response.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      activity_type,
      entity_type,
      entity_id,
      description,
      details = {},
      user_name = "System User",
      user_email,
    } = data;

    // Validate required fields
    if (!activity_type || !entity_type || !entity_id || !description) {
      return Response.json(
        {
          error:
            "Missing required fields: activity_type, entity_type, entity_id, description",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO activity_logs (
        activity_type,
        entity_type,
        entity_id,
        description,
        details,
        user_name,
        user_email
      ) VALUES (
        ${activity_type},
        ${entity_type},
        ${entity_id},
        ${description},
        ${JSON.stringify(details)},
        ${user_name},
        ${user_email}
      )
      RETURNING *
    `;

    return Response.json({
      activityLog: result[0],
      message: "Activity logged successfully",
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
    return Response.json(
      { error: "Failed to create activity log" },
      { status: 500 },
    );
  }
}
