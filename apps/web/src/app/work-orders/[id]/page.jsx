import React, { useState } from "react";
import {
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  Building2,
  User,
  MapPin,
  Calendar,
  IndianRupee,
  CreditCard,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bell,
  ChevronDown,
  Save,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function WorkOrderDetailPage({ params }) {
  const { id } = params;
  const [isEditing, setIsEditing] = useState(false);
  const [statusChange, setStatusChange] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const queryClient = useQueryClient();

  // Fetch work order details
  const {
    data: workOrderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["work-order", id],
    queryFn: async () => {
      const response = await fetch(`/api/work-orders/${id}`);
      if (!response.ok) throw new Error("Failed to fetch work order");
      return response.json();
    },
  });

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: async (status) => {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["work-order", id]);
      queryClient.invalidateQueries(["work-orders"]);
      setStatusChange("");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete work order");
      }
      return response.json();
    },
    onSuccess: () => {
      window.location.href = "/work-orders";
    },
  });

  const workOrder = workOrderData?.workOrder;

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { bg: "bg-[#9CA3AF] dark:bg-[#6B7280]", text: "text-white" },
      "In Progress": {
        bg: "bg-[#F59E0B] dark:bg-[#D97706]",
        text: "text-white",
      },
      Completed: { bg: "bg-[#10B981] dark:bg-[#059669]", text: "text-white" },
      Active: { bg: "bg-[#3B82F6] dark:bg-[#2563EB]", text: "text-white" },
    };

    const config = statusConfig[status] || statusConfig["Draft"];

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleStatusChange = () => {
    if (statusChange && statusChange !== workOrder.status) {
      statusMutation.mutate(statusChange);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
    setDeleteError("");
    setAdminPassword("");
  };

  const confirmDelete = async () => {
    // Simple admin check - in a real app, this would be more secure
    if (adminPassword !== "admin123") {
      setDeleteError("Invalid admin password");
      return;
    }

    try {
      const response = await fetch(
        `/api/work-orders/${id}?admin_permission=true`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete work order");
      }

      setShowDeleteModal(false);
      window.location.href = "/work-orders";
    } catch (error) {
      console.error("Error deleting work order:", error);
      setDeleteError(error.message);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);

      // Fetch PDF from backend
      const response = await fetch(`/api/work-orders/${id}/pdf`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `WorkOrder_${workOrder.wo_number.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex items-center justify-center">
        <Loader2
          size={32}
          className="text-[#0C8657] dark:text-[#22C55E] animate-spin"
        />
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle
            size={32}
            className="text-[#E95D5D] dark:text-[#EF4444] mx-auto mb-2"
          />
          <p className="text-[#5D667E] dark:text-[#B0B0B0]">
            {error?.message || "Work order not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212]">
      {/* Header */}
      <header className="bg-[#0C8657] dark:bg-[#0C8657] h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 px-2 py-1 rounded transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:block">Back</span>
        </button>
        <h1 className="text-xl font-semibold ml-4">Work Order Details</h1>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <button className="relative hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 p-1 rounded transition-colors">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD83B] dark:bg-[#FCD34D] rounded-full"></div>
          </button>

          <button className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 px-2 py-1 rounded transition-colors">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format"
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden md:block">Admin User</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF] mb-2">
                {workOrder.wo_number}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#5D667E] dark:text-[#B0B0B0]">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(workOrder.date)}
                </div>
                <div className="flex items-center gap-2">
                  Status: {getStatusBadge(workOrder.status)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  (window.location.href = `/work-orders/${id}/edit`)
                }
                className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] dark:bg-[#2563EB] text-white rounded-lg hover:bg-[#2563EB] dark:hover:bg-[#1D4ED8] transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#10B981] dark:bg-[#059669] text-white rounded-lg hover:bg-[#059669] dark:hover:bg-[#047857] disabled:opacity-50 transition-colors"
              >
                {pdfLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span>{pdfLoading ? "Generating PDF..." : "Download PDF"}</span>
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#EF4444] dark:bg-[#DC2626] text-white rounded-lg hover:bg-[#DC2626] dark:hover:bg-[#B91C1C] disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company & Basic Info */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2
                  size={20}
                  className="text-[#0C8657] dark:text-[#22C55E]"
                />
                <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                  Company Information
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Company
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                    {workOrder.company_name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Date
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {formatDate(workOrder.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Details */}
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
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Vendor Name
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                    {workOrder.vendor_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Contact Number
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {workOrder.vendor_contact || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Address
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {workOrder.vendor_address || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    GST Number
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {workOrder.vendor_gst || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Details */}
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
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Site Name
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                    {workOrder.site_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Project Description
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {workOrder.project_description || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Description of Work
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF] whitespace-pre-wrap">
                    {workOrder.work_description}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment & Bank Details */}
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
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Payment Terms
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {workOrder.payment_terms || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Bank Name
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {workOrder.vendor_bank_name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    Account Number
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {workOrder.vendor_bank_account || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                    IFSC Code
                  </label>
                  <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {workOrder.vendor_bank_ifsc || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee
                  size={20}
                  className="text-[#0C8657] dark:text-[#22C55E]"
                />
                <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                  Financial Summary
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                    Total Amount:
                  </span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                    {formatCurrency(workOrder.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                    SGST ({workOrder.sgst_percent}%):
                  </span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {formatCurrency(workOrder.sgst_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                    CGST ({workOrder.cgst_percent}%):
                  </span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF]">
                    {formatCurrency(workOrder.cgst_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                    Gross Amount:
                  </span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                    {formatCurrency(workOrder.gross_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                    Retention ({workOrder.retention_percent}%):
                  </span>
                  <span className="text-[#1F2739] dark:text-[#FFFFFF]">
                    -{formatCurrency(workOrder.retention_amount)}
                  </span>
                </div>
                <hr className="border-[#E4E8EE] dark:border-[#333333]" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#1F2739] dark:text-[#FFFFFF]">
                    Net Amount:
                  </span>
                  <span className="text-[#0C8657] dark:text-[#22C55E]">
                    {formatCurrency(workOrder.net_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText
                  size={20}
                  className="text-[#0C8657] dark:text-[#22C55E]"
                />
                <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                  Status Management
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-2">
                    Current Status
                  </label>
                  {getStatusBadge(workOrder.status)}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-2">
                    Change Status
                  </label>
                  <select
                    value={statusChange}
                    onChange={(e) => setStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                  >
                    <option value="">Select Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {statusChange && statusChange !== workOrder.status && (
                  <button
                    onClick={handleStatusChange}
                    disabled={statusMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] disabled:opacity-50 transition-colors"
                  >
                    {statusMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>Update Status</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={24} className="text-red-500" />
                <h3 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                  Delete Work Order
                </h3>
              </div>

              <p className="text-[#5D667E] dark:text-[#B0B0B0] mb-4">
                Are you sure you want to delete work order{" "}
                <strong>{workOrder?.wo_number}</strong>? This action cannot be
                undone and requires admin permission.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter admin password"
                />
                {deleteError && (
                  <p className="text-red-500 text-sm mt-2">{deleteError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-[#E4E8EE] dark:border-[#333333] text-[#5D667E] dark:text-[#B0B0B0] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {statusMutation.isSuccess && (
          <div className="fixed bottom-6 right-6 bg-[#10B981] dark:bg-[#059669] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle2 size={20} />
            <span>Status updated successfully!</span>
          </div>
        )}

        {/* Error Messages */}
        {(statusMutation.error || deleteMutation.error) && (
          <div className="fixed bottom-6 right-6 bg-[#EF4444] dark:bg-[#DC2626] text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {statusMutation.error?.message || deleteMutation.error?.message}
          </div>
        )}
      </main>
    </div>
  );
}
