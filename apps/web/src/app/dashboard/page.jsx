"use client";

import React, { useState } from "react";
import {
  FileText,
  Clock,
  AlertCircle,
  IndianRupee,
  Plus,
  Building2,
  Eye,
  ArrowRight,
  Calendar,
  MapPin,
  Menu,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Home,
  Users,
  Settings,
  Loader2,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FullScreenError } from "@/components/FullScreenError";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    "work-orders": true,
  });

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Fetch work orders for dashboard data
  const {
    data: workOrdersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["work-orders"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/work-orders");
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

  // Fetch companies for count
  const {
    data: companiesData,
    isLoading: companiesLoading,
    error: companiesError,
  } = useQuery({
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

  // Handle errors
  if (ordersError || companiesError) {
    return (
      <FullScreenError
        message={`Error loading dashboard: ${ordersError?.message || companiesError?.message || "Unknown error"}`}
      />
    );
  }

  // Safely extract data with fallbacks
  const workOrders = Array.isArray(workOrdersData?.workOrders)
    ? workOrdersData.workOrders
    : [];
  const companies = Array.isArray(companiesData?.companies)
    ? companiesData.companies
    : [];

  // Calculate summary statistics with safety checks
  const totalWorkOrders = workOrders.length;
  const activeWorkOrders = workOrders.filter(
    (wo) => wo && (wo.status === "In Progress" || wo.status === "Active"),
  ).length;
  const pendingApprovals = workOrders.filter(
    (wo) => wo && wo.status === "Draft",
  ).length;
  const totalValue = workOrders.reduce((sum, wo) => {
    if (!wo || !wo.net_amount) return sum;
    const amount = parseFloat(wo.net_amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Status breakdown with safety checks
  const statusCounts = {
    Draft: workOrders.filter((wo) => wo && wo.status === "Draft").length,
    "In Progress": workOrders.filter((wo) => wo && wo.status === "In Progress")
      .length,
    Active: workOrders.filter((wo) => wo && wo.status === "Active").length,
    Completed: workOrders.filter((wo) => wo && wo.status === "Completed")
      .length,
  };

  // Recent work orders (last 5) with safety checks
  const recentWorkOrders = workOrders
    .filter((wo) => wo && wo.id && wo.created_at) // Filter out invalid entries
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    })
    .slice(0, 5);

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
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    if (!status)
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
          Unknown
        </span>
      );

    const statusConfig = {
      Draft: { bg: "bg-gray-500", text: "text-white" },
      "In Progress": { bg: "bg-yellow-500", text: "text-white" },
      Completed: { bg: "bg-green-500", text: "text-white" },
      Active: { bg: "bg-blue-500", text: "text-white" },
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

  const getStatusDot = (status) => {
    if (!status) return "bg-gray-500";

    const statusConfig = {
      Draft: "bg-gray-500",
      "In Progress": "bg-yellow-500",
      Completed: "bg-green-500",
      Active: "bg-blue-500",
    };

    return statusConfig[status] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - completely hidden when closed */}
      {sidebarOpen && (
        <div className="fixed lg:relative inset-y-0 left-0 z-50 bg-white w-64 flex-shrink-0 border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              <div className="flex items-center gap-3 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                <Home size={16} className="text-green-700" />
                <span className="font-semibold">Dashboard</span>
              </div>

              <div
                onClick={() => (window.location.href = "/companies")}
                className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg cursor-pointer transition-colors"
              >
                <Building2 size={16} className="text-green-700" />
                <span className="font-medium">Companies</span>
              </div>

              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg transition-colors ${expandedMenus["work-orders"] ? "bg-green-50" : "hover:bg-green-50"}`}
                  onClick={() => toggleMenu("work-orders")}
                >
                  <FileText size={16} className="text-green-700" />
                  <span className="font-semibold text-green-700 flex-1">
                    Work Orders
                  </span>
                  {expandedMenus["work-orders"] ? (
                    <ChevronUp size={14} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-600" />
                  )}
                </div>

                {expandedMenus["work-orders"] && (
                  <div className="ml-6 mt-2 space-y-1 bg-green-50 p-2 rounded-lg">
                    <div
                      onClick={() =>
                        (window.location.href = "/work-orders/create")
                      }
                      className="px-3 py-2 text-gray-600 text-sm cursor-pointer hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                    >
                      Create Work Order
                    </div>
                    <div
                      onClick={() => (window.location.href = "/work-orders")}
                      className="px-3 py-2 text-gray-600 text-sm cursor-pointer hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                    >
                      Work Order List
                    </div>
                    <div
                      onClick={() =>
                        (window.location.href = "/work-orders/pending-payments")
                      }
                      className="px-3 py-2 text-gray-600 text-sm cursor-pointer hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                    >
                      Pending Payments
                    </div>
                  </div>
                )}
              </div>

              <div
                onClick={() => (window.location.href = "/vendors")}
                className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg cursor-pointer transition-colors"
              >
                <Users size={16} className="text-green-700" />
                <span className="font-medium flex-1">Vendors</span>
              </div>

              <div
                onClick={() => (window.location.href = "/activity-logs")}
                className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg cursor-pointer transition-colors"
              >
                <Activity size={16} className="text-green-700" />
                <span className="font-medium flex-1">Activity Log</span>
              </div>

              <div
                onClick={() => (window.location.href = "/settings")}
                className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg cursor-pointer transition-colors"
              >
                <Settings size={16} className="text-green-700" />
                <span className="font-medium flex-1">Settings</span>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-green-600 h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="hover:bg-white/10 p-2 rounded transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Centered Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-semibold text-white">
              Work Order Management System
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative hover:bg-white/10 p-2 rounded transition-colors">
              <Bell size={24} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
            </button>

            <button className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-2 rounded transition-colors">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format"
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:block">Admin User</span>
              <ChevronDown size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening with your work orders.
              </p>
            </div>

            {ordersLoading || companiesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="text-green-600 animate-spin" />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Work Orders */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-700 text-sm font-medium">
                          Total Work Orders
                        </p>
                        <p className="text-3xl font-bold text-blue-800 mt-2">
                          {totalWorkOrders}
                        </p>
                        <p className="text-blue-600 text-xs mt-1">All Time</p>
                      </div>
                      <div className="bg-blue-200 p-3 rounded-full">
                        <FileText size={24} className="text-blue-700" />
                      </div>
                    </div>
                  </div>

                  {/* Active Work Orders */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-700 text-sm font-medium">
                          Active Work Orders
                        </p>
                        <p className="text-3xl font-bold text-yellow-800 mt-2">
                          {activeWorkOrders}
                        </p>
                        <p className="text-yellow-600 text-xs mt-1">
                          Currently Active
                        </p>
                      </div>
                      <div className="bg-yellow-200 p-3 rounded-full">
                        <Clock size={24} className="text-yellow-700" />
                      </div>
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-700 text-sm font-medium">
                          Pending Approvals
                        </p>
                        <p className="text-3xl font-bold text-orange-800 mt-2">
                          {pendingApprovals}
                        </p>
                        <p className="text-orange-600 text-xs mt-1">
                          Awaiting Action
                        </p>
                      </div>
                      <div className="bg-orange-200 p-3 rounded-full">
                        <AlertCircle size={24} className="text-orange-700" />
                      </div>
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-700 text-sm font-medium">
                          Total Value
                        </p>
                        <p className="text-3xl font-bold text-green-800 mt-2">
                          {formatCurrency(totalValue).replace("₹", "Rs. ")}
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          Total Pipeline
                        </p>
                      </div>
                      <div className="bg-green-200 p-3 rounded-full">
                        <IndianRupee size={24} className="text-green-700" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() =>
                        (window.location.href = "/work-orders/create")
                      }
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg flex-1 sm:flex-none"
                    >
                      <Plus size={20} />
                      <span>Create New Work Order</span>
                    </button>

                    <button
                      onClick={() => (window.location.href = "/companies")}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Building2 size={20} />
                      <span>Manage Companies</span>
                    </button>

                    <button
                      onClick={() => (window.location.href = "/work-orders")}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Eye size={20} />
                      <span>View All Work Orders</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Recent Work Orders - 60% width */}
                  <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Recent Work Orders
                        </h2>
                        <button
                          onClick={() =>
                            (window.location.href = "/work-orders")
                          }
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
                        >
                          <span>View All</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>

                      {recentWorkOrders.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText
                            size={32}
                            className="text-gray-400 mx-auto mb-2"
                          />
                          <p className="text-gray-600">No work orders found</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                                  WO Number
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                                  Vendor Name
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                                  Date
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                                  Net Amount
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentWorkOrders.map((workOrder) => (
                                <tr
                                  key={workOrder.id}
                                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                  <td className="py-3 px-4">
                                    <button
                                      onClick={() =>
                                        (window.location.href = `/work-orders/${workOrder.id}`)
                                      }
                                      className="text-green-600 hover:underline font-medium text-sm"
                                    >
                                      {workOrder.wo_number || "N/A"}
                                    </button>
                                  </td>
                                  <td className="py-3 px-4 text-gray-900 text-sm">
                                    {workOrder.vendor_name || "N/A"}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Calendar size={12} />
                                      {formatDate(workOrder.date)}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-gray-900 font-semibold text-sm">
                                    <div className="flex items-center gap-1">
                                      <IndianRupee size={12} />
                                      {formatCurrency(workOrder.net_amount)
                                        .replace("₹", "")
                                        .replace(".00", "")}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    {getStatusBadge(workOrder.status)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Overview - 40% width */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Status Overview
                      </h2>

                      <div className="space-y-4">
                        {Object.entries(statusCounts).map(([status, count]) => (
                          <div
                            key={status}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusDot(status)}`}
                              ></div>
                              <span className="text-gray-900 font-medium">
                                {status}
                              </span>
                            </div>
                            <div className="bg-gray-50 px-3 py-1 rounded-full">
                              <span className="text-gray-900 font-bold">
                                {count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
