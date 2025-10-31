import sql from "@/app/api/utils/sql";

// GET - Get single vendor
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const vendor = await sql`
      SELECT * FROM vendors WHERE id = ${id}
    `;

    if (vendor.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Vendor not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      vendor: vendor[0],
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch vendor",
      },
      { status: 500 },
    );
  }
}

// PUT - Update vendor
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // Validate required fields if provided
    if (data.vendor_name !== undefined && !data.vendor_name?.trim()) {
      return Response.json(
        { success: false, error: "Vendor name is required" },
        { status: 400 },
      );
    }

    if (
      data.vendor_type !== undefined &&
      !["Service Provider", "Contractor"].includes(data.vendor_type)
    ) {
      return Response.json(
        { success: false, error: "Invalid vendor type" },
        { status: 400 },
      );
    }

    if (data.contact_number !== undefined && !data.contact_number?.trim()) {
      return Response.json(
        { success: false, error: "Contact number is required" },
        { status: 400 },
      );
    }

    if (
      data.default_retention_percent !== undefined &&
      ![0, 5, 10].includes(Number(data.default_retention_percent))
    ) {
      return Response.json(
        { success: false, error: "Invalid retention percentage" },
        { status: 400 },
      );
    }

    if (
      data.status !== undefined &&
      !["Active", "Inactive"].includes(data.status)
    ) {
      return Response.json(
        { success: false, error: "Invalid status" },
        { status: 400 },
      );
    }

    // Build the SET clause manually
    const setParts = [];
    const values = [id];
    let paramIndex = 2;

    // Only update provided fields
    const updateableFields = [
      "vendor_name",
      "vendor_type",
      "contact_person",
      "contact_number",
      "email",
      "address",
      "gst_number",
      "pan_number",
      "bank_name",
      "bank_account_number",
      "bank_ifsc",
      "default_retention_percent",
      "status",
    ];

    updateableFields.forEach((field) => {
      if (data[field] !== undefined) {
        setParts.push(`${field} = $${paramIndex}`);
        values.push(data[field]?.trim ? data[field].trim() : data[field]);
        paramIndex++;
      }
    });

    if (setParts.length === 0) {
      return Response.json(
        { success: false, error: "No fields to update" },
        { status: 400 },
      );
    }

    const query = `
      UPDATE vendors 
      SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json(
        { success: false, error: "Vendor not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      vendor: result[0],
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to update vendor",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete vendor
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if vendor is used in any work orders
    const workOrderCheck = await sql`
      SELECT id FROM work_orders 
      WHERE vendor_name IN (
        SELECT vendor_name FROM vendors WHERE id = ${id}
      )
      LIMIT 1
    `;

    if (workOrderCheck.length > 0) {
      return Response.json(
        {
          success: false,
          error:
            "Cannot delete vendor. This vendor is referenced in existing work orders.",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      DELETE FROM vendors 
      WHERE id = ${id} 
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        { success: false, error: "Vendor not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to delete vendor",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
