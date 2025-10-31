import sql from "@/app/api/utils/sql";
import {
  logActivity,
  createWorkOrderActivity,
} from "@/app/api/utils/activityLogger";

// GET - List all work orders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = `
      SELECT 
        wo.id, wo.wo_number, wo.date, wo.vendor_name, wo.site_name,
        wo.total_amount, wo.net_amount, wo.status, wo.created_at,
        c.company_name
      FROM work_orders wo
      LEFT JOIN companies c ON wo.company_id = c.id
    `;

    let params = [];

    if (search && search.trim()) {
      query += ` WHERE 
        LOWER(wo.wo_number) LIKE LOWER($1) OR 
        LOWER(wo.vendor_name) LIKE LOWER($1) OR
        LOWER(wo.site_name) LIKE LOWER($1) OR
        LOWER(COALESCE(c.company_name, '')) LIKE LOWER($1)
      `;
      params.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY wo.created_at DESC`;

    const workOrders = await sql(query, params);

    // Ensure all work orders have required properties
    const sanitizedWorkOrders = workOrders.map((wo) => ({
      id: wo.id || null,
      wo_number: wo.wo_number || "N/A",
      date: wo.date || null,
      vendor_name: wo.vendor_name || "N/A",
      site_name: wo.site_name || "N/A",
      total_amount: wo.total_amount || 0,
      net_amount: wo.net_amount || 0,
      status: wo.status || "Draft",
      created_at: wo.created_at || new Date().toISOString(),
      company_name: wo.company_name || null,
    }));

    return Response.json({
      success: true,
      workOrders: sanitizedWorkOrders,
    });
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch work orders",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create new work order
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    const required = [
      "company_id",
      "vendor_name",
      "site_name",
      "work_description",
      "total_amount",
    ];

    const missingFields = [];
    for (const field of required) {
      if (
        !data[field] ||
        (typeof data[field] === "string" && !data[field].trim())
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return Response.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate numeric fields
    const totalAmount = parseFloat(data.total_amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return Response.json(
        {
          success: false,
          error: "Total amount must be a positive number",
        },
        { status: 400 },
      );
    }

    // Validate company exists
    const companyCheck = await sql`
      SELECT id FROM companies WHERE id = ${data.company_id}
    `;

    if (companyCheck.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Invalid company ID",
        },
        { status: 400 },
      );
    }

    // Calculate amounts with safety checks
    const hasGst = data.has_gst !== false; // default to true if not specified
    const retentionPercent = Math.max(
      0,
      Math.min(100, parseFloat(data.retention_percent || 0)),
    ); // Clamp between 0-100

    // Use dynamic GST percentages with validation
    const sgstPercent = hasGst
      ? Math.max(0, Math.min(50, parseFloat(data.sgst_percent || 9)))
      : 0;
    const cgstPercent = hasGst
      ? Math.max(0, Math.min(50, parseFloat(data.cgst_percent || 9)))
      : 0;
    const sgstAmount = (totalAmount * sgstPercent) / 100;
    const cgstAmount = (totalAmount * cgstPercent) / 100;
    const grossAmount = totalAmount + sgstAmount + cgstAmount;
    const retentionAmount = (grossAmount * retentionPercent) / 100;
    const netAmount = grossAmount - retentionAmount;

    // Generate WO number if not provided
    let woNumber = data.wo_number;
    if (!woNumber || !woNumber.trim()) {
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();

        // Get vendor name first few characters (safe handling)
        const vendorShort =
          (data.vendor_name || "")
            .replace(/[^a-zA-Z]/g, "")
            .substring(0, 8)
            .toUpperCase() || "VENDOR";
        const siteShort =
          (data.site_name || "")
            .replace(/[^a-zA-Z]/g, "")
            .substring(0, 5)
            .toUpperCase() || "SITE";

        // Check for existing WO numbers today to get next sequence
        const existingCount = await sql`
          SELECT COUNT(*) as count FROM work_orders 
          WHERE DATE(created_at) = CURRENT_DATE
        `;

        const sequence = String(
          parseInt(existingCount[0]?.count || 0) + 1,
        ).padStart(2, "0");
        woNumber = `W.O.${dd}${mm}${yyyy}-PBPL-${siteShort}-${vendorShort}-${sequence}`;
      } catch (genError) {
        console.error("Error generating WO number:", genError);
        woNumber = `WO-${Date.now()}`; // Fallback
      }
    }

    // Check for duplicate WO number
    const duplicateCheck = await sql`
      SELECT id FROM work_orders WHERE wo_number = ${woNumber}
    `;

    if (duplicateCheck.length > 0) {
      return Response.json(
        {
          success: false,
          error: "Work order number already exists",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO work_orders (
        wo_number, date, company_id, vendor_name, vendor_contact, vendor_address, vendor_gst,
        site_name, project_description, work_description, total_amount, has_gst, sgst_percent, cgst_percent,
        sgst_amount, cgst_amount, gross_amount, retention_percent, retention_amount, net_amount,
        payment_terms, vendor_bank_name, vendor_bank_account, vendor_bank_ifsc, status
      ) VALUES (
        ${woNumber}, 
        ${data.date || new Date().toISOString().split("T")[0]}, 
        ${data.company_id},
        ${data.vendor_name?.trim() || ""}, 
        ${data.vendor_contact?.trim() || ""}, 
        ${data.vendor_address?.trim() || ""}, 
        ${data.vendor_gst?.trim() || ""},
        ${data.site_name?.trim() || ""}, 
        ${data.project_description?.trim() || ""}, 
        ${data.work_description?.trim() || ""},
        ${totalAmount}, 
        ${hasGst}, 
        ${sgstPercent}, 
        ${cgstPercent}, 
        ${sgstAmount}, 
        ${cgstAmount}, 
        ${grossAmount},
        ${retentionPercent}, 
        ${retentionAmount}, 
        ${netAmount}, 
        ${data.payment_terms?.trim() || ""},
        ${data.vendor_bank_name?.trim() || ""}, 
        ${data.vendor_bank_account?.trim() || ""}, 
        ${data.vendor_bank_ifsc?.trim() || ""},
        ${data.status?.trim() || "Draft"}
      ) RETURNING *
    `;

    const workOrder = result[0];

    // Log activity for work order creation
    try {
      const activityData = createWorkOrderActivity(
        workOrder.id,
        workOrder,
        "Admin User",
      );
      await logActivity(activityData);
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Don't fail the request if logging fails
    }

    return Response.json({
      success: true,
      workOrder: result[0],
    });
  } catch (error) {
    console.error("Error creating work order:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to create work order",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
