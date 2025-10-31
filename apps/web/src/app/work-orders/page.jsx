"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Building2,
  MapPin,
  IndianRupee,
  Eye,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Menu,
  Bell,
  ChevronDown,
  Home,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function WorkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Fetch work orders
  const {
    data: workOrdersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["work-orders", searchTerm],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);

        const response = await fetch(`/api/work-orders?${params}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch work orders: ${response.status} ${response.statusText}`,
          );
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching work orders:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch companies for filter dropdown
  const { data: companiesData, error: companiesError } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/companies");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch companies: ${response.status} ${response.statusText}`,
          );
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Safely extract data with null checks
  const workOrders = Array.isArray(workOrdersData?.workOrders)
    ? workOrdersData.workOrders
    : [];
  const companies = Array.isArray(companiesData?.companies)
    ? companiesData.companies
    : [];

  // Filter work orders based on selected filters with null safety
  const filteredWorkOrders = workOrders.filter((wo) => {
    if (!wo) return false; // Skip null/undefined work orders

    const matchesCompany =
      !selectedCompany ||
      (wo.company_name && wo.company_name === selectedCompany);
    const matchesStatus =
      !selectedStatus || (wo.status && wo.status === selectedStatus);
    return matchesCompany && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (!status) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
          Unknown
        </span>
      );
    }

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
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "Rs. 0";

    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "Rs. 0";
    }
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
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const calculateTotalValue = () => {
    return filteredWorkOrders.reduce((sum, wo) => {
      if (!wo || !wo.net_amount) return sum;
      const amount = parseFloat(wo.net_amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const getStatusCount = (status) => {
    return filteredWorkOrders.filter((wo) => wo && wo.status === status).length;
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212]">
      {/* Header */}
      <header className="bg-[#0C8657] dark:bg-[#0C8657] h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 px-2 py-1 rounded transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:block">Back</span>
          </button>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 px-2 py-1 rounded transition-colors"
            title="Go to Dashboard"
          >
            <Home size={20} />
            <span className="hidden sm:block">Dashboard</span>
          </button>
        </div>

        <h1 className="text-xl font-semibold ml-4">Work Orders</h1>

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

      <main className="max-w-7xl mx-auto p-6">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
            All Work Orders
          </h1>

          <button
            onClick={() => (window.location.href = "/work-orders/create")}
            className="flex items-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors"
          >
            <Plus size={16} />
            <span>Create New Work Order</span>
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9DA5BC] dark:text-[#888888]"
              />
              <input
                type="text"
                placeholder="Search by WO number or vendor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
              />
            </div>

            {/* Company Filter */}
            <div className="relative">
              <Building2
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9DA5BC] dark:text-[#888888] z-10"
              />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] appearance-none"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option
                    key={company.id || company.company_name}
                    value={company.company_name || ""}
                  >
                    {company.company_name || "Unknown Company"}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9DA5BC] dark:text-[#888888] z-10"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E] appearance-none"
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                size={32}
                className="text-[#0C8657] dark:text-[#22C55E] animate-spin"
              />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle
                  size={32}
                  className="text-[#E95D5D] dark:text-[#EF4444] mx-auto mb-2"
                />
                <p className="text-[#5D667E] dark:text-[#B0B0B0]">
                  {error.message || "Failed to load work orders"}
                </p>
              </div>
            </div>
          ) : filteredWorkOrders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText
                  size={32}
                  className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-2"
                />
                <p className="text-[#5D667E] dark:text-[#B0B0B0]">
                  {searchTerm || selectedCompany || selectedStatus
                    ? "No work orders found matching your filters"
                    : "No work orders found"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F7FAFC] dark:bg-[#262626] border-b border-[#E4E8EE] dark:border-[#333333]">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      WO Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Vendor Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Site Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Net Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((workOrder) => (
                    <tr
                      key={workOrder?.id || Math.random()}
                      className="border-b border-[#E4E8EE] dark:border-[#333333] hover:bg-[#F7FAFC] dark:hover:bg-[#262626] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            (window.location.href = `/work-orders/${workOrder?.id || ""}`)
                          }
                          className="text-[#0C8657] dark:text-[#22C55E] hover:underline font-medium"
                        >
                          {workOrder?.wo_number || "N/A"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-[#5D667E] dark:text-[#B0B0B0]">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(workOrder?.date)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#1F2739] dark:text-[#FFFFFF]">
                        {workOrder?.vendor_name || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-[#5D667E] dark:text-[#B0B0B0]">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {workOrder?.site_name || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#1F2739] dark:text-[#FFFFFF] font-semibold">
                        <div className="flex items-center gap-1">
                          <IndianRupee size={14} />
                          {formatCurrency(workOrder?.net_amount).replace(
                            "₹",
                            "",
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(workOrder?.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredWorkOrders.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-4">
              <h3 className="text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                Total Work Orders
              </h3>
              <p className="text-2xl font-bold text-[#1F2739] dark:text-[#FFFFFF]">
                {filteredWorkOrders.length}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-4">
              <h3 className="text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                Total Value
              </h3>
              <p className="text-2xl font-bold text-[#0C8657] dark:text-[#22C55E]">
                {formatCurrency(calculateTotalValue())}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-4">
              <h3 className="text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                Draft Orders
              </h3>
              <p className="text-2xl font-bold text-[#9CA3AF] dark:text-[#6B7280]">
                {getStatusCount("Draft")}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-4">
              <h3 className="text-sm font-medium text-[#5D667E] dark:text-[#B0B0B0] mb-1">
                Completed Orders
              </h3>
              <p className="text-2xl font-bold text-[#10B981] dark:text-[#059669]">
                {getStatusCount("Completed")}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
