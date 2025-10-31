import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useEditWorkOrder(id) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    company_id: "",
    wo_number: "",
    date: "",
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
    status: "Draft",
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

  const {
    data: workOrderData,
    isLoading: isOrderLoading,
    error: orderError,
  } = useQuery({
    queryKey: ["work-order", id],
    queryFn: async () => {
      const response = await fetch(`/api/work-orders/${id}`);
      if (!response.ok) throw new Error("Failed to fetch work order");
      return response.json();
    },
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      if (!response.ok) throw new Error("Failed to fetch companies");
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (submissionData) => {
      // Ensure we always use the latest calculated amounts
      const dataToSend = {
        ...submissionData,
        sgst_amount: calculatedAmounts.sgst_amount,
        cgst_amount: calculatedAmounts.cgst_amount,
        gross_amount: calculatedAmounts.gross_amount,
        retention_amount: calculatedAmounts.retention_amount,
        net_amount: calculatedAmounts.net_amount,
      };

      const response = await fetch(`/api/work-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update work order");
      }
      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["work-order", id] });
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setTimeout(() => {
        window.location.href = `/work-orders/${id}`;
      }, 2000);
    },
  });

  const companies = companiesData?.companies || [];
  const workOrder = workOrderData?.workOrder;

  useEffect(() => {
    if (workOrder) {
      setFormData({
        company_id: workOrder.company_id || "",
        wo_number: workOrder.wo_number || "",
        date: workOrder.date
          ? new Date(workOrder.date).toISOString().split("T")[0]
          : "",
        vendor_name: workOrder.vendor_name || "",
        vendor_contact: workOrder.vendor_contact || "",
        vendor_address: workOrder.vendor_address || "",
        vendor_gst: workOrder.vendor_gst || "",
        site_name: workOrder.site_name || "",
        project_description: workOrder.project_description || "",
        work_description: workOrder.work_description || "",
        total_amount: workOrder.total_amount || "",
        has_gst: workOrder.has_gst !== false,
        sgst_percent: workOrder.sgst_percent || 9,
        cgst_percent: workOrder.cgst_percent || 9,
        retention_percent: workOrder.retention_percent || 0,
        payment_terms: workOrder.payment_terms || "",
        vendor_bank_name: workOrder.vendor_bank_name || "",
        vendor_bank_account: workOrder.vendor_bank_account || "",
        vendor_bank_ifsc: workOrder.vendor_bank_ifsc || "",
        status: workOrder.status || "Draft",
      });
      if (workOrder.company_id) {
        const company = companies.find(
          (c) => c.id.toString() === workOrder.company_id.toString(),
        );
        setSelectedCompany(company);
      }
    }
  }, [workOrder, companies]);

  useEffect(() => {
    const totalAmount = parseFloat(formData.total_amount) || 0;
    const retentionPercent = parseFloat(formData.retention_percent) || 0;
    const sgstPercent = parseFloat(formData.sgst_percent) || 0;
    const cgstPercent = parseFloat(formData.cgst_percent) || 0;

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGstChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      has_gst: e.target.value === "true",
    }));
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setFormData((prev) => ({ ...prev, company_id: companyId }));
    const company = companies.find((c) => c.id.toString() === companyId);
    setSelectedCompany(company);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return {
    formData,
    setFormData,
    calculatedAmounts,
    selectedCompany,
    showSuccess,
    isOrderLoading,
    orderError,
    companies,
    workOrder,
    updateMutation,
    handleInputChange,
    handleCompanyChange,
    handleGstChange,
    handleSubmit,
  };
}
