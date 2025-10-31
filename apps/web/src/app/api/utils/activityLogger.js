// Activity logging utility functions

export async function logActivity(activityData) {
  try {
    const response = await fetch("/api/activity-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw error to prevent breaking the main operation
  }
}

export function createWorkOrderActivity(
  workOrderId,
  workOrderData,
  userName = "System User",
) {
  return {
    activity_type: "CREATE",
    entity_type: "work_order",
    entity_id: workOrderId,
    description: `Work Order ${workOrderData.wo_number} created for vendor ${workOrderData.vendor_name}`,
    details: {
      wo_number: workOrderData.wo_number,
      vendor_name: workOrderData.vendor_name,
      site_name: workOrderData.site_name,
      total_amount: workOrderData.total_amount,
      net_amount: workOrderData.net_amount,
      status: workOrderData.status,
    },
    user_name: userName,
  };
}

export function updateWorkOrderActivity(
  workOrderId,
  originalData,
  updatedData,
  userName = "System User",
) {
  const changes = [];

  // Track specific field changes
  const fieldsToTrack = [
    "wo_number",
    "vendor_name",
    "site_name",
    "total_amount",
    "net_amount",
    "status",
    "vendor_contact",
    "work_description",
  ];

  fieldsToTrack.forEach((field) => {
    if (originalData[field] !== updatedData[field]) {
      changes.push({
        field,
        from: originalData[field],
        to: updatedData[field],
      });
    }
  });

  return {
    activity_type: "UPDATE",
    entity_type: "work_order",
    entity_id: workOrderId,
    description: `Work Order ${updatedData.wo_number} updated`,
    details: {
      wo_number: updatedData.wo_number,
      changes: changes,
      updated_fields: changes.map((c) => c.field),
    },
    user_name: userName,
  };
}

export function deleteWorkOrderActivity(
  workOrderId,
  workOrderData,
  userName = "System User",
) {
  return {
    activity_type: "DELETE",
    entity_type: "work_order",
    entity_id: workOrderId,
    description: `Work Order ${workOrderData.wo_number} deleted`,
    details: {
      wo_number: workOrderData.wo_number,
      vendor_name: workOrderData.vendor_name,
      site_name: workOrderData.site_name,
      net_amount: workOrderData.net_amount,
    },
    user_name: userName,
  };
}

export function statusChangeActivity(
  workOrderId,
  woNumber,
  fromStatus,
  toStatus,
  userName = "System User",
) {
  return {
    activity_type: "STATUS_CHANGE",
    entity_type: "work_order",
    entity_id: workOrderId,
    description: `Work Order ${woNumber} status changed from ${fromStatus} to ${toStatus}`,
    details: {
      wo_number: woNumber,
      from_status: fromStatus,
      to_status: toStatus,
    },
    user_name: userName,
  };
}
