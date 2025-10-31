import React, { useState, useEffect } from "react";
import {
  Save,
  FileText,
  ArrowLeft,
  Building2,
  User,
  MapPin,
  Calculator,
  CreditCard,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function CreateWorkOrderPage() {
  const [formData, setFormData] = useState({
    company_id: "",
    wo_number: "",
    date: new Date().toISOString().split("T")[0],
    vendor_name: "",
    vendor_contact: "",
    vendor_address: "",
    vendor_gst: "",
    site_name: "",
    project_description: "",
    work_description: "",
    total_amount: "",
    has_gst: true,
    sgst_percent: 9,
    cgst_percent: 9,
    retention_percent: 0,
    payment_terms: "",
    vendor_bank_name: "",
    vendor_bank_account: "",
    vendor_bank_ifsc: "",
  });

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    sgst_amount: 0,
    cgst_amount: 0,
    gross_amount: 0,
    retention_amount: 0,
    net_amount: 0,
  });

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch companies for dropdown
  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      if (!response.ok) throw new Error("Failed to fetch companies");
      return response.json();
    },
  });

  // Create work order mutation
  const createMutation = useMutation({
    mutationFn: async (workOrderData) => {
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...workOrderData, ...calculatedAmounts }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create work order");
      }
      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
  });

  const companies = companiesData?.companies || [];

  // Real-time calculations
  useEffect(() => {
    const totalAmount = parseFloat(formData.total_amount) || 0;
    const retentionPercent = parseFloat(formData.retention_percent) || 0;
    const sgstPercent = parseFloat(formData.sgst_percent) || 0;
    const cgstPercent = parseFloat(formData.cgst_percent) || 0;

    // Only apply GST if has_gst is true
    const sgstAmount = formData.has_gst ? (totalAmount * sgstPercent) / 100 : 0;
    const cgstAmount = formData.has_gst ? (totalAmount * cgstPercent) / 100 : 0;

    const grossAmount = totalAmount + sgstAmount + cgstAmount;
    const retentionAmount = (grossAmount * retentionPercent) / 100;
    const netAmount = grossAmount - retentionAmount;

    setCalculatedAmounts({
      sgst_amount: sgstAmount,
      cgst_amount: cgstAmount,
      gross_amount: grossAmount,
      retention_amount: retentionAmount,
      net_amount: netAmount,
    });
  }, [
    formData.total_amount,
    formData.has_gst,
    formData.sgst_percent,
    formData.cgst_percent,
    formData.retention_percent,
  ]);

  // Auto-generate WO number
  useEffect(() => {
    if (formData.vendor_name && formData.site_name && !formData.wo_number) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();

      const vendorShort = formData.vendor_name
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 8);
      const siteShort = formData.site_name
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 5);

      const woNumber = `W.O.${dd}${mm}${yyyy}-PBPL-${siteShort}-${vendorShort}-01`;
      setFormData((prev) => ({ ...prev, wo_number: woNumber }));
    }
  }, [formData.vendor_name, formData.site_name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setFormData((prev) => ({ ...prev, company_id: companyId }));

    const company = companies.find((c) => c.id.toString() === companyId);
    setSelectedCompany(company);
  };

  const handleSubmit = (e, status = "Draft") => {
    e.preventDefault();
    createMutation.mutate({ ...formData, status });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212]">
      {/* Header */}
      <header className="bg-[#0C8657] dark:bg-[#0C8657] h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 px-2 py-1 rounded transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:block">Back</span>
        </button>
        <h1 className="text-xl font-semibold ml-4">Create Work Order</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Basic Info */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2
                    size={20}
                    className="text-[#0C8657] dark:text-[#22C55E]"
                  />
                  <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                    Basic Information
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Company *
                    </label>
                    <select
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleCompanyChange}
                      required
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Work Order Number
                    </label>
                    <input
                      type="text"
                      name="wo_number"
                      value={formData.wo_number}
                      onChange={handleInputChange}
                      placeholder="Auto-generated based on vendor and site"
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-[#F7FAFC] dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Vendor Details */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User
                    size={20}
                    className="text-[#0C8657] dark:text-[#22C55E]"
                  />
                  <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                    Vendor Details
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Vendor Name *
                    </label>
                    <input
                      type="text"
                      name="vendor_name"
                      value={formData.vendor_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Vendor Contact Number
                    </label>
                    <input
                      type="tel"
                      name="vendor_contact"
                      value={formData.vendor_contact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Vendor Address
                    </label>
                    <textarea
                      name="vendor_address"
                      value={formData.vendor_address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Vendor GST No. (Optional)
                    </label>
                    <input
                      type="text"
                      name="vendor_gst"
                      value={formData.vendor_gst}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Project Details */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin
                    size={20}
                    className="text-[#0C8657] dark:text-[#22C55E]"
                  />
                  <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                    Project Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      name="site_name"
                      value={formData.site_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Project Description
                    </label>
                    <input
                      type="text"
                      name="project_description"
                      value={formData.project_description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Description of Work *
                    </label>
                    <textarea
                      name="work_description"
                      value={formData.work_description}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Detailed description of the work to be performed..."
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Financial Details */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator
                    size={20}
                    className="text-[#0C8657] dark:text-[#22C55E]"
                  />
                  <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                    Financial Details
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Total Amount (Before Tax) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="total_amount"
                      value={formData.total_amount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      GST Applicable
                    </label>
                    <select
                      name="has_gst"
                      value={formData.has_gst}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          has_gst: e.target.value === "true",
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>

                  {formData.has_gst && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                          SGST %
                        </label>
                        <select
                          name="sgst_percent"
                          value={formData.sgst_percent}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                        >
                          <option value={0}>0%</option>
                          <option value={2.5}>2.5%</option>
                          <option value={6}>6%</option>
                          <option value={9}>9%</option>
                          <option value={14}>14%</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                          CGST %
                        </label>
                        <select
                          name="cgst_percent"
                          value={formData.cgst_percent}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                        >
                          <option value={0}>0%</option>
                          <option value={2.5}>2.5%</option>
                          <option value={6}>6%</option>
                          <option value={9}>9%</option>
                          <option value={14}>14%</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Retention %
                    </label>
                    <select
                      name="retention_percent"
                      value={formData.retention_percent}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                    </select>
                  </div>
                </div>

                {/* Calculated amounts display */}
                <div className="mt-6 p-4 bg-[#F7FAFC] dark:bg-[#262626] rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {formData.has_gst && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                            SGST ({formData.sgst_percent}%):
                          </span>
                          <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                            {formatCurrency(calculatedAmounts.sgst_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                            CGST ({formData.cgst_percent}%):
                          </span>
                          <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                            {formatCurrency(calculatedAmounts.cgst_amount)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                        Gross Amount:
                      </span>
                      <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                        {formatCurrency(calculatedAmounts.gross_amount)}
                      </span>
                    </div>
                    {formData.retention_percent > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                          Retention Amount:
                        </span>
                        <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                          {formatCurrency(calculatedAmounts.retention_amount)}
                        </span>
                      </div>
                    )}
                  </div>
                  <hr className="my-3 border-[#E4E8EE] dark:border-[#333333]" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-[#1F2739] dark:text-[#FFFFFF]">
                      Net Amount:
                    </span>
                    <span className="text-[#0C8657] dark:text-[#22C55E]">
                      {formatCurrency(calculatedAmounts.net_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Payment & Bank */}
              <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard
                    size={20}
                    className="text-[#0C8657] dark:text-[#22C55E]"
                  />
                  <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                    Payment & Bank Details
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Payment Terms
                    </label>
                    <select
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    >
                      <option value="">Select Payment Terms</option>
                      <option value="100% Advance">100% Advance</option>
                      <option value="After Completion">After Completion</option>
                      <option value="50% Advance + 50% After">
                        50% Advance + 50% After
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Vendor Bank Name
                    </label>
                    <input
                      type="text"
                      name="vendor_bank_name"
                      value={formData.vendor_bank_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Vendor Bank Account No.
                    </label>
                    <input
                      type="text"
                      name="vendor_bank_account"
                      value={formData.vendor_bank_account}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                      Vendor Bank IFSC
                    </label>
                    <input
                      type="text"
                      name="vendor_bank_ifsc"
                      value={formData.vendor_bank_ifsc}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  <span>Save as Draft</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "Active")}
                  disabled={createMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] dark:bg-[#3B82F6] text-white rounded-lg hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <FileText size={20} />
                  )}
                  <span>Save & Generate PDF</span>
                </button>
              </div>
            </form>
          </div>

          {/* Company Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedCompany && (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2
                    size={20}
                    className="text-[#0C8657] dark:text-[#22C55E]"
                  />
                  <h3 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                    Company Details
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-[#1F2739] dark:text-[#FFFFFF]">
                      {selectedCompany.company_name}
                    </span>
                  </div>

                  {selectedCompany.address && (
                    <div>
                      <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                        Address:
                      </span>
                      <p className="text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                        {selectedCompany.address}
                      </p>
                    </div>
                  )}

                  {selectedCompany.contact_person && (
                    <div>
                      <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                        Contact Person:
                      </span>
                      <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                        {selectedCompany.contact_person}
                      </p>
                    </div>
                  )}

                  {selectedCompany.contact_number && (
                    <div>
                      <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                        Contact:
                      </span>
                      <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                        {selectedCompany.contact_number}
                      </p>
                    </div>
                  )}

                  {selectedCompany.gst_number && (
                    <div>
                      <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                        GST:
                      </span>
                      <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                        {selectedCompany.gst_number}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed bottom-6 right-6 bg-[#10B981] dark:bg-[#059669] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle2 size={20} />
            <span>Work Order created successfully!</span>
          </div>
        )}
      </main>
    </div>
  );
}
