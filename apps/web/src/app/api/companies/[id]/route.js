import sql from "@/app/api/utils/sql";

// GET - Get single company by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT 
        id, company_name, address, contact_person, contact_number, gst_number,
        bank_name, account_number as bank_account_number, ifsc_code as bank_ifsc,
        created_at, updated_at
      FROM companies 
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Company not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      company: result[0],
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch company",
      },
      { status: 500 },
    );
  }
}

// PUT - Update company
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // Check if company exists
    const existing = await sql`
      SELECT id FROM companies WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Company not found",
        },
        { status: 404 },
      );
    }

    // Check for duplicate GST number (excluding current company)
    if (data.gst_number) {
      const duplicate = await sql`
        SELECT id FROM companies 
        WHERE gst_number = ${data.gst_number} AND id != ${id}
      `;

      if (duplicate.length > 0) {
        return Response.json(
          {
            success: false,
            error: "Company with this GST number already exists",
          },
          { status: 400 },
        );
      }
    }

    const result = await sql`
      UPDATE companies SET
        company_name = ${data.company_name || ""},
        address = ${data.address || ""},
        contact_person = ${data.contact_person || ""},
        contact_number = ${data.contact_number || ""},
        gst_number = ${data.gst_number || ""},
        bank_name = ${data.bank_name || ""},
        account_number = ${data.bank_account_number || ""},
        ifsc_code = ${data.bank_ifsc || ""},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return Response.json({
      success: true,
      company: result[0],
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to update company",
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete company
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if company exists
    const existing = await sql`
      SELECT id FROM companies WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Company not found",
        },
        { status: 404 },
      );
    }

    await sql`DELETE FROM companies WHERE id = ${id}`;

    return Response.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to delete company",
      },
      { status: 500 },
    );
  }
}
