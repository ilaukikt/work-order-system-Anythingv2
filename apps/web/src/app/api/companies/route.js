import { supabase } from "@/lib/supabase";

// GET - List all companies
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase
      .from("companies")
      .select(
        "id, company_name, address, contact_person, contact_number, gst_number, bank_name, account_number, ifsc_code, created_at, updated_at",
      )
      .order("company_name", { ascending: true });

    if (search && search.trim()) {
      query = query.or(
        `company_name.ilike.%${search.trim()}%,contact_person.ilike.%${search.trim()}%,gst_number.ilike.%${search.trim()}%`,
      );
    }

    const { data: companies, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return Response.json(
        {
          success: false,
          error: "Failed to fetch companies",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // Ensure all companies have required properties
    const sanitizedCompanies = companies.map((company) => ({
      id: company.id || null,
      company_name: company.company_name || "N/A",
      address: company.address || "",
      contact_person: company.contact_person || "",
      contact_number: company.contact_number || "",
      gst_number: company.gst_number || "",
      bank_name: company.bank_name || "",
      bank_account_number: company.account_number || "",
      bank_ifsc: company.ifsc_code || "",
      created_at: company.created_at || new Date().toISOString(),
      updated_at: company.updated_at || new Date().toISOString(),
    }));

    return Response.json({
      success: true,
      companies: sanitizedCompanies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch companies",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create new company
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ["company_name"];
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

    // Check for duplicate GST number if provided
    if (data.gst_number && data.gst_number.trim()) {
      const { data: existing, error: gstError } = await supabase
        .from("companies")
        .select("id")
        .eq("gst_number", data.gst_number.trim());

      if (gstError) {
        console.error("GST check error:", gstError);
        return Response.json(
          {
            success: false,
            error: "Failed to validate GST number",
          },
          { status: 500 },
        );
      }

      if (existing && existing.length > 0) {
        return Response.json(
          {
            success: false,
            error: "Company with this GST number already exists",
          },
          { status: 400 },
        );
      }
    }

    // Check for duplicate company name
    const { data: existingName, error: nameError } = await supabase
      .from("companies")
      .select("id")
      .ilike("company_name", data.company_name.trim());

    if (nameError) {
      console.error("Name check error:", nameError);
      return Response.json(
        {
          success: false,
          error: "Failed to validate company name",
        },
        { status: 500 },
      );
    }

    if (existingName && existingName.length > 0) {
      return Response.json(
        {
          success: false,
          error: "Company with this name already exists",
        },
        { status: 400 },
      );
    }

    const companyData = {
      company_name: data.company_name?.trim() || "",
      address: data.address?.trim() || "",
      contact_person: data.contact_person?.trim() || "",
      contact_number: data.contact_number?.trim() || "",
      gst_number: data.gst_number?.trim() || "",
      bank_name: data.bank_name?.trim() || "",
      account_number: data.bank_account_number?.trim() || "",
      ifsc_code: data.bank_ifsc?.trim() || "",
      city: data.city?.trim() || "",
      state: data.state?.trim() || "",
      pincode: data.pincode?.trim() || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: result, error: insertError } = await supabase
      .from("companies")
      .insert([companyData])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return Response.json(
        {
          success: false,
          error: "Failed to create company",
          details: insertError.message,
        },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      company: result,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to create company",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
