import sql, {
  buildDynamicQuery,
  createResponse,
  handleError,
  validateRequired,
  validateEnum,
  insertRecord,
} from "@/app/api/utils/sql";

// GET - List all vendors with enhanced filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const vendorType = searchParams.get("vendor_type");
    const status = searchParams.get("status");

    const baseQuery = `
      SELECT 
        id, vendor_name, vendor_type, contact_person, contact_number, 
        email, address, gst_number, pan_number, bank_name, 
        bank_account_number, bank_ifsc, default_retention_percent, 
        status, created_from, created_at, updated_at
      FROM vendors
      WHERE 1=1
    `;

    // Build dynamic filters using new helper
    const filters = {};
    if (search && search.trim()) {
      filters.search = {
        fields: ["vendor_name", "contact_number", "contact_person"],
        term: search.trim(),
      };
    }
    if (vendorType && vendorType !== "All") {
      filters.vendor_type = vendorType;
    }
    if (status && status !== "All") {
      filters.status = status;
    }

    const { query, params } = buildDynamicQuery(baseQuery, filters);
    const finalQuery = query + ` ORDER BY created_at DESC`;

    const vendors = await sql(finalQuery, params);

    return createResponse({ vendors });
  } catch (error) {
    return handleError(error, "Failed to fetch vendors");
  }
}

// POST - Create new vendor with enhanced validation
export async function POST(request) {
  try {
    const data = await request.json();

    // Use new validation helpers
    validateRequired(data, ["vendor_name", "vendor_type", "contact_number"]);
    validateEnum(
      data.vendor_type,
      ["Service Provider", "Contractor"],
      "vendor type",
    );

    const retentionPercent = Number(data.default_retention_percent || 0);
    validateEnum(retentionPercent, [0, 5, 10], "retention percentage");

    const status = data.status || "Active";
    validateEnum(status, ["Active", "Inactive"], "status");

    // Prepare clean data
    const vendorData = {
      vendor_name: data.vendor_name?.trim(),
      vendor_type: data.vendor_type,
      contact_person: data.contact_person?.trim() || null,
      contact_number: data.contact_number?.trim(),
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      gst_number: data.gst_number?.trim() || null,
      pan_number: data.pan_number?.trim() || null,
      bank_name: data.bank_name?.trim() || null,
      bank_account_number: data.bank_account_number?.trim() || null,
      bank_ifsc: data.bank_ifsc?.trim() || null,
      default_retention_percent: retentionPercent,
      status: status,
      created_from: data.created_from || "Manual",
    };

    // Use new insert helper
    const vendor = await insertRecord("vendors", vendorData);

    return createResponse({ vendor });
  } catch (error) {
    if (error.message.includes("duplicate key")) {
      return createResponse(
        { error: "Vendor with this name already exists" },
        false,
        409,
      );
    }
    return handleError(error, "Failed to create vendor");
  }
}
