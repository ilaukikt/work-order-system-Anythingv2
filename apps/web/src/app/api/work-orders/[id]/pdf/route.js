import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    console.log("Generating PDF for work order ID:", id);

    // Fetch work order with company details
    const workOrder = await sql`
      SELECT 
        wo.*,
        c.company_name, c.address as company_address, c.contact_person as company_contact_person,
        c.contact_number as company_contact_number, c.gst_number as company_gst,
        c.bank_name as company_bank_name, c.account_number as company_account_number,
        c.ifsc_code as company_ifsc, c.signatory_name, c.signatory_designation
      FROM work_orders wo
      LEFT JOIN companies c ON wo.company_id = c.id
      WHERE wo.id = ${id}
    `;

    if (workOrder.length === 0) {
      console.log("Work order not found for ID:", id);
      return Response.json(
        {
          success: false,
          error: "Work order not found",
        },
        { status: 404 },
      );
    }

    const wo = workOrder[0];
    console.log("Found work order:", wo.wo_number);

    // Format currency function
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      })
        .format(amount)
        .replace("₹", "Rs.");
    };

    // Format date function
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Auto-generate project description from work description if not provided
    const projectDescription = wo.project_description || wo.work_description;

    // Generate HTML for PDF - Safe value handling
    const safeValue = (value) =>
      value ? String(value).replace(/'/g, "&#39;").replace(/"/g, "&quot;") : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Work Order - ${safeValue(wo.wo_number)}</title>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>WORK ORDER</h1>
          </div>

          <!-- Two Column Layout -->
          <div class="two-column">
            <!-- Left Column - Vendor Details -->
            <div class="left-column">
              <div class="to-section">
                <strong>To,</strong><br>
                <strong>${safeValue(wo.vendor_name)}</strong><br>
                ${wo.vendor_address ? safeValue(wo.vendor_address).replace(/\n/g, "<br>") : ""}<br>
                ${wo.vendor_contact ? "Contact: " + safeValue(wo.vendor_contact) : ""}<br>
                ${wo.vendor_gst ? "GST No.: " + safeValue(wo.vendor_gst) : ""}
              </div>
            </div>

            <!-- Right Column - Work Order Details -->
            <div class="right-column">
              <div class="wo-details">
                <strong>W.O. ${safeValue(wo.wo_number)}</strong><br>
                <strong>Date:</strong> ${formatDate(wo.date)}<br>
                <strong>Site:</strong> ${safeValue(wo.site_name)}<br>
                ${wo.company_contact_person ? "<strong>Contact Person:</strong> " + safeValue(wo.company_contact_person) + "<br>" : ""}
                ${wo.company_contact_number ? "<strong>Contact No.:</strong> " + safeValue(wo.company_contact_number) + "<br>" : ""}
                ${wo.company_gst ? "<strong>GST No.:</strong> " + safeValue(wo.company_gst) : ""}
              </div>
            </div>
          </div>

          <!-- Project Description -->
          ${projectDescription ? `<div class="project-description">${safeValue(projectDescription)}</div>` : ""}

          <!-- Services Table -->
          <table class="services-table">
            <thead>
              <tr>
                <th class="sno-col">S. No.</th>
                <th class="description-col">DESCRIPTION OF SERVICES</th>
                <th class="amount-col">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="center">1</td>
                <td>${safeValue(wo.work_description)}</td>
                <td class="right">${formatCurrency(wo.total_amount || 0)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Financial Summary -->
          <div class="financial-summary">
            <div class="amount-row">
              <span>Total Amount:</span>
              <span>${formatCurrency(wo.total_amount || 0)}</span>
            </div>
            ${
              wo.has_gst
                ? `
            <div class="amount-row">
              <span>SGST ${wo.sgst_percent || 9}%:</span>
              <span>${formatCurrency(wo.sgst_amount || 0)}</span>
            </div>
            <div class="amount-row">
              <span>CGST ${wo.cgst_percent || 9}%:</span>
              <span>${formatCurrency(wo.cgst_amount || 0)}</span>
            </div>
            `
                : ""
            }
            <div class="amount-row total-row">
              <span><strong>Gross Amount:</strong></span>
              <span><strong>${formatCurrency(wo.gross_amount || 0)}</strong></span>
            </div>
            ${
              wo.retention_percent > 0
                ? `
            <div class="amount-row">
              <span>Retention ${wo.retention_percent}%:</span>
              <span>- ${formatCurrency(wo.retention_amount || 0)}</span>
            </div>
            `
                : ""
            }
            <div class="amount-row net-row">
              <span><strong>Net Amount:</strong></span>
              <span><strong>${formatCurrency(wo.net_amount || 0)}</strong></span>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="terms-section">
            <strong>TERMS & CONDITIONS:</strong>
            <ol>
              <li><strong>Payment terms:</strong> ${safeValue(wo.payment_terms) || "As per agreement"}</li>
              <li>Tax invoice with all supporting documents or report is required to submit after completion of service</li>
              ${wo.retention_percent > 0 ? `<li>Retention: ${wo.retention_percent}% (${formatCurrency(wo.retention_amount || 0)}) will be deducted from gross amount</li>` : ""}
            </ol>
          </div>

          <!-- Bank Details -->
          <div class="bank-details">
            <strong>BANK DETAILS:</strong>
            <div class="bank-info">
              <strong>Name:</strong> ${safeValue(wo.vendor_bank_name) || "N/A"}<br>
              <strong>Acc. No:</strong> ${safeValue(wo.vendor_bank_account) || "N/A"}<br>
              <strong>IFSC:</strong> ${safeValue(wo.vendor_bank_ifsc) || "N/A"}
            </div>
          </div>

          <!-- Footer with Signatures -->
          <div class="footer-signatures">
            <div class="signature-left">
              <div class="signature-box">
                <div class="signature-label">Accepted Work Order</div>
                <div class="signature-space"></div>
                <div class="signature-title">Signature of Contractor</div>
              </div>
            </div>
            <div class="signature-right">
              <div class="signature-box">
                <div class="signature-label">For ${safeValue(wo.company_name) || "Company"}</div>
                <div class="signature-space"></div>
                <div class="signature-title">Authorized Signatory</div>
                ${wo.signatory_name ? '<div class="signatory-name">' + safeValue(wo.signatory_name) + "</div>" : ""}
                ${wo.signatory_designation ? '<div class="signatory-designation">' + safeValue(wo.signatory_designation) + "</div>" : ""}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // CSS Styles for PDF
    const styles = `
      @page {
        margin: 15mm;
        size: A4;
      }
      
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        line-height: 1.3;
        color: #000;
        margin: 0;
        padding: 0;
      }
      
      .container {
        max-width: 100%;
        margin: 0 auto;
      }
      
      .header {
        text-align: center;
        margin-bottom: 15px;
        border-bottom: 2px solid #000;
        padding-bottom: 8px;
      }
      
      .header h1 {
        font-size: 20px;
        font-weight: bold;
        margin: 0;
        letter-spacing: 1.5px;
      }
      
      .two-column {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        gap: 10px;
      }
      
      .left-column {
        width: 48%;
      }
      
      .right-column {
        width: 48%;
        text-align: left;
      }
      
      .to-section {
        border: 1px solid #000;
        padding: 10px;
        min-height: 80px;
        font-size: 11px;
      }
      
      .wo-details {
        border: 1px solid #000;
        padding: 10px;
        min-height: 80px;
        font-size: 11px;
      }
      
      .project-description {
        margin: 10px 0;
        padding: 8px;
        border: 1px solid #000;
        background-color: #f9f9f9;
        font-size: 10px;
      }
      
      .services-table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
        border: 1px solid #000;
      }
      
      .services-table th,
      .services-table td {
        border: 1px solid #000;
        padding: 6px;
        text-align: left;
        font-size: 10px;
      }
      
      .services-table th {
        background-color: #f0f0f0;
        font-weight: bold;
        text-align: center;
        font-size: 11px;
      }
      
      .sno-col {
        width: 60px;
      }
      
      .amount-col {
        width: 100px;
      }
      
      .description-col {
        width: auto;
      }
      
      .center {
        text-align: center;
      }
      
      .right {
        text-align: right;
      }
      
      .financial-summary {
        margin: 12px 0;
        border: 1px solid #000;
        padding: 10px;
        background-color: #f9f9f9;
      }
      
      .amount-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
        padding: 2px 0;
        font-size: 10px;
      }
      
      .total-row {
        border-top: 1px solid #000;
        margin-top: 6px;
        padding-top: 4px;
        font-size: 11px;
      }
      
      .net-row {
        border-top: 2px solid #000;
        margin-top: 6px;
        padding-top: 4px;
        font-size: 12px;
      }
      
      .terms-section {
        margin: 12px 0;
        border: 1px solid #000;
        padding: 10px;
        font-size: 10px;
      }
      
      .terms-section ol {
        margin: 5px 0 0 0;
        padding-left: 15px;
      }
      
      .terms-section li {
        margin-bottom: 3px;
      }
      
      .bank-details {
        margin: 12px 0;
        border: 1px solid #000;
        padding: 10px;
        font-size: 10px;
      }
      
      .bank-info {
        margin-top: 5px;
      }
      
      .footer-signatures {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
        gap: 2px;
      }
      
      .signature-left,
      .signature-right {
        width: 48%;
        border: 1px solid #000;
        padding: 10px;
        text-align: center;
        min-height: 60px;
        font-size: 10px;
      }
      
      .signature-box {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      
      .signature-label {
        font-weight: bold;
        margin-bottom: 25px;
      }
      
      .signature-space {
        flex-grow: 1;
        min-height: 25px;
      }
      
      .signature-title {
        font-weight: bold;
        border-top: 1px solid #000;
        padding-top: 3px;
      }
      
      .signatory-name {
        font-size: 9px;
        margin-top: 2px;
      }
      
      .signatory-designation {
        font-size: 8px;
        font-style: italic;
      }
    `;

    // Generate PDF using the integration
    const pdfResponse = await fetch("/integrations/pdf-generation/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: {
          html: htmlContent,
        },
        styles: [
          {
            content: styles,
          },
        ],
      }),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error("PDF Generation Error:", errorText);
      throw new Error(
        `Failed to generate PDF: ${pdfResponse.status} ${pdfResponse.statusText}`,
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="WorkOrder_${wo.wo_number.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to generate PDF",
      },
      { status: 500 },
    );
  }
}
