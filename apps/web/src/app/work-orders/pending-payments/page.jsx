"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Bell,
  ChevronDown,
  Home,
  Calendar,
  IndianRupee,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PendingPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch work orders
  const {
    data: workOrdersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["work-orders"],
    queryFn: async () => {
      const response = await fetch("/api/work-orders");
      if (!response.ok) {
        throw new Error("Failed to fetch work orders");
      }
      return response.json();
    },
  });

  const workOrders = workOrdersData?.workOrders || [];

  // Filter for pending payments - assuming these are work orders that are completed but still have payment obligations
  const pendingPayments = workOrders
    .filter((wo) => {
      if (!wo) return false;

      // Show work orders that are not in Draft status and have payment amounts
      const hasPaymentDue = wo.net_amount && parseFloat(wo.net_amount) > 0;
      const isNotDraft = wo.status !== "Draft";

      // Search filter
      const matchesSearch =
        !searchTerm ||
        (wo.wo_number &&
          wo.wo_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (wo.vendor_name &&
          wo.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === "All" || wo.status === statusFilter;

      return hasPaymentDue && isNotDraft && matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "Rs. 0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "In Progress": { bg: "bg-yellow-500", text: "text-white", icon: Clock },
      Active: { bg: "bg-blue-500", text: "text-white", icon: Clock },
      Completed: { bg: "bg-green-500", text: "text-white", icon: CheckCircle2 },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-500",
      text: "text-white",
      icon: Clock,
    };
    const IconComponent = config.icon;

    return (
      <span
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <IconComponent size={12} />
        {status}
      </span>
    );
  };

  const getPaymentStatus = (workOrder) => {
    // Simple logic - you can enhance this based on your business rules
    if (workOrder.status === "Completed") {
      return {
        status: "Overdue",
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    } else if (
      workOrder.status === "In Progress" ||
      workOrder.status === "Active"
    ) {
      return {
        status: "Due",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    }
    return {
      status: "Pending",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    };
  };

  const totalPendingAmount = pendingPayments.reduce((sum, wo) => {
    const amount = parseFloat(wo.net_amount) || 0;
    return sum + amount;
  }, 0);

  const overdueCount = pendingPayments.filter(
    (wo) => wo.status === "Completed",
  ).length;
  const dueCount = pendingPayments.filter(
    (wo) => wo.status === "In Progress" || wo.status === "Active",
  ).length;

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      {/* Header */}
      <header className="bg-[#0C8657] h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:block">Back</span>
          </button>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors"
            title="Go to Dashboard"
          >
            <Home size={20} />
            <span className="hidden sm:block">Dashboard</span>
          </button>
        </div>

        <h1 className="text-xl font-semibold ml-4">Pending Payments</h1>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <button className="relative hover:bg-white/10 p-1 rounded transition-colors">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD83B] rounded-full"></div>
          </button>

          <button className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors">
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

      <main className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F2739] mb-2">
            Pending Payments
          </h1>
          <p className="text-[#5D667E]">
            Track and manage outstanding payments for work orders
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">
                  Total Pending Amount
                </p>
                <p className="text-3xl font-bold text-red-800 mt-2">
                  {formatCurrency(totalPendingAmount)}
                </p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <IndianRupee size={24} className="text-red-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm font-medium">
                  Due Payments
                </p>
                <p className="text-3xl font-bold text-yellow-800 mt-2">
                  {dueCount}
                </p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <Clock size={24} className="text-yellow-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium">
                  Overdue Payments
                </p>
                <p className="text-3xl font-bold text-orange-800 mt-2">
                  {overdueCount}
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <AlertCircle size={24} className="text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#E4E8EE] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9DA5BC]"
              />
              <input
                type="text"
                placeholder="Search by WO number or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E8EE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C8657]"
              />
            </div>

            <div className="relative">
              <Filter
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9DA5BC] z-10"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E8EE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C8657] appearance-none"
              >
                <option value="All">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg border border-[#E4E8EE] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="text-[#0C8657] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
                <p className="text-[#5D667E]">
                  Failed to load pending payments
                </p>
              </div>
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle2
                  size={32}
                  className="text-green-500 mx-auto mb-2"
                />
                <p className="text-[#5D667E]">
                  {searchTerm || statusFilter !== "All"
                    ? "No pending payments found matching your filters"
                    : "No pending payments found"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F7FAFC] border-b border-[#E4E8EE]">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E]">
                      WO Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E]">
                      Vendor
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E]">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E]">
                      Amount Due
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E]">
                      Work Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E]">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((payment) => {
                    const paymentStatus = getPaymentStatus(payment);
                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-[#E4E8EE] hover:bg-[#F7FAFC] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              (window.location.href = `/work-orders/${payment.id}`)
                            }
                            className="text-[#0C8657] hover:underline font-medium"
                          >
                            {payment.wo_number}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-[#1F2739] font-medium">
                          {payment.vendor_name}
                        </td>
                        <td className="py-3 px-4 text-[#5D667E]">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(payment.date)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#1F2739] font-bold">
                          <div className="flex items-center gap-1">
                            <IndianRupee size={14} />
                            {formatCurrency(payment.net_amount).replace(
                              "₹",
                              "",
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.bgColor} ${paymentStatus.color}`}
                          >
                            {paymentStatus.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
