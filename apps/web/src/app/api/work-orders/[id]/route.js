import sql from "@/app/api/utils/sql";
import {
  logActivity,
  updateWorkOrderActivity,
  deleteWorkOrderActivity,
  statusChangeActivity,
} from "@/app/api/utils/activityLogger";

// GET - Get single work order with company details
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const workOrder = await sql`
      SELECT 
        wo.*,
        c.company_name, c.address as company_address, c.contact_person as company_contact_person,
        c.contact_number as company_contact_number, c.gst_number as company_gst,
        c.bank_name as company_bank_name, c.account_number as company_account_number,
        c.ifsc_code as company_ifsc
      FROM work_orders wo
      LEFT JOIN companies c ON wo.company_id = c.id
      WHERE wo.id = ${id}
    `;

    if (workOrder.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Work order not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      workOrder: workOrder[0],
    });
  } catch (error) {
    console.error("Error fetching work order:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch work order",
      },
      { status: 500 },
    );
  }
}

// PUT - Update work order
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    console.log("Received data for update:", data);

    // Get the original work order for comparison
    const originalWorkOrder = await sql`
      SELECT * FROM work_orders WHERE id = ${id}
    `;

    if (originalWorkOrder.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Work order not found",
        },
        { status: 404 },
      );
    }

    // Use the calculated amounts sent from frontend if they exist
    // This ensures consistency between frontend calculations and backend storage
    let updateData = { ...data };

    // If calculated amounts aren't provided, recalculate them
    if (
      data.total_amount !== undefined &&
      !data.sgst_amount &&
      data.sgst_amount !== 0
    ) {
      const totalAmount = parseFloat(data.total_amount) || 0;
      const hasGst = data.has_gst !== false; // default to true if not specified
      const sgstPercent = parseFloat(data.sgst_percent || 9);
      const cgstPercent = parseFloat(data.cgst_percent || 9);
      const retentionPercent = parseFloat(data.retention_percent || 0);

      // Only apply GST if has_gst is true
      const sgstAmount = hasGst ? (totalAmount * sgstPercent) / 100 : 0;
      const cgstAmount = hasGst ? (totalAmount * cgstPercent) / 100 : 0;
      const grossAmount = totalAmount + sgstAmount + cgstAmount;
      const retentionAmount = (grossAmount * retentionPercent) / 100;
      const netAmount = grossAmount - retentionAmount;

      updateData = {
        ...updateData,
        sgst_amount: sgstAmount,
        cgst_amount: cgstAmount,
        gross_amount: grossAmount,
        retention_amount: retentionAmount,
        net_amount: netAmount,
      };
    }

    console.log("Final update data:", updateData);

    // Remove any undefined or null values
    const cleanUpdateData = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Build the SET clause manually to avoid issues
    const setParts = [];
    const values = [id];
    let paramIndex = 2;

    Object.keys(cleanUpdateData).forEach((field) => {
      setParts.push(`${field} = $${paramIndex}`);
      values.push(cleanUpdateData[field]);
      paramIndex++;
    });

    if (setParts.length === 0) {
      return Response.json(
        {
          success: false,
          error: "No fields to update",
        },
        { status: 400 },
      );
    }

    const query = `
      UPDATE work_orders 
      SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;

    console.log("SQL Query:", query);
    console.log("Values:", values);

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Work order not found",
        },
        { status: 404 },
      );
    }

    const updatedWorkOrder = result[0];

    // Log activity for work order update
    try {
      // Special case for status changes
      if (data.status && data.status !== originalWorkOrder[0].status) {
        const statusActivityData = statusChangeActivity(
          parseInt(id),
          updatedWorkOrder.wo_number,
          originalWorkOrder[0].status,
          data.status,
          "Admin User",
        );
        await logActivity(statusActivityData);
      } else {
        // General update activity
        const activityData = updateWorkOrderActivity(
          parseInt(id),
          originalWorkOrder[0],
          updatedWorkOrder,
          "Admin User",
        );
        await logActivity(activityData);
      }
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Don't fail the request if logging fails
    }

    return Response.json({
      success: true,
      workOrder: result[0],
    });
  } catch (error) {
    console.error("Error updating work order:", error);
    console.error("Error details:", error.message);
    return Response.json(
      {
        success: false,
        error: `Failed to update work order: ${error.message}`,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete work order (Admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check for admin permission
    const { searchParams } = new URL(request.url);
    const adminPermission = searchParams.get("admin_permission");

    if (adminPermission !== "true") {
      return Response.json(
        {
          success: false,
          error: "Admin permission required to delete work orders",
        },
        { status: 403 },
      );
    }

    // Get work order details before deletion for logging
    const workOrderToDelete = await sql`
      SELECT * FROM work_orders WHERE id = ${id}
    `;

    if (workOrderToDelete.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Work order not found",
        },
        { status: 404 },
      );
    }

    const result = await sql`
      DELETE FROM work_orders 
      WHERE id = ${id} 
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Work order not found",
        },
        { status: 404 },
      );
    }

    // Log activity for work order deletion
    try {
      const activityData = deleteWorkOrderActivity(
        parseInt(id),
        workOrderToDelete[0],
        "Admin User",
      );
      await logActivity(activityData);
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Don't fail the request if logging fails
    }

    return Response.json({
      success: true,
      message: "Work order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting work order:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to delete work order",
      },
      { status: 500 },
    );
  }
}
