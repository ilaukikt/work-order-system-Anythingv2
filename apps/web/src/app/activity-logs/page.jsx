"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Activity,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  Clock,
  ChevronDown,
  Eye,
  Bell,
  Menu,
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ActivityLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch activity logs
  const {
    data: activityData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "activity-logs",
      currentPage,
      selectedEntityType,
      selectedActivityType,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (selectedEntityType) {
        params.append("entity_type", selectedEntityType);
      }
      if (selectedActivityType) {
        params.append("activity_type", selectedActivityType);
      }

      const response = await fetch(`/api/activity-logs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch activity logs");
      return response.json();
    },
  });

  const activityLogs = activityData?.activityLogs || [];
  const pagination = activityData?.pagination || {};

  // Filter logs based on search term (client-side)
  const filteredLogs = activityLogs.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.description.toLowerCase().includes(searchLower) ||
      log.user_name.toLowerCase().includes(searchLower) ||
      log.entity_type.toLowerCase().includes(searchLower) ||
      log.activity_type.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case "CREATE":
        return <Plus size={16} className="text-green-600" />;
      case "UPDATE":
        return <Edit size={16} className="text-blue-600" />;
      case "DELETE":
        return <Trash2 size={16} className="text-red-600" />;
      case "STATUS_CHANGE":
        return <RefreshCw size={16} className="text-purple-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getActivityBadge = (activityType) => {
    const config = {
      CREATE: { bg: "bg-green-100", text: "text-green-800", label: "Created" },
      UPDATE: { bg: "bg-blue-100", text: "text-blue-800", label: "Updated" },
      DELETE: { bg: "bg-red-100", text: "text-red-800", label: "Deleted" },
      STATUS_CHANGE: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Status Changed",
      },
    };

    const activityConfig = config[activityType] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: activityType,
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${activityConfig.bg} ${activityConfig.text}`}
      >
        {activityConfig.label}
      </span>
    );
  };

  const getEntityBadge = (entityType) => {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {entityType.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const handleViewWorkOrder = (entityId) => {
    window.location.href = `/work-orders/${entityId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:block">Back</span>
        </button>
        <h1 className="text-xl font-semibold ml-4">Activity Log</h1>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
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

      <main className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Activity Log
          </h1>
          <p className="text-gray-600">
            Track all activities and changes in your work order management
            system.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search activities, users, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown
                size={16}
                className={`transform transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Type
                </label>
                <select
                  value={selectedEntityType}
                  onChange={(e) => setSelectedEntityType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Entities</option>
                  <option value="work_order">Work Orders</option>
                  <option value="company">Companies</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type
                </label>
                <select
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Activities</option>
                  <option value="CREATE">Created</option>
                  <option value="UPDATE">Updated</option>
                  <option value="DELETE">Deleted</option>
                  <option value="STATUS_CHANGE">Status Changes</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Activity Log Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="text-green-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
              <p className="text-gray-600">
                {error?.message || "Failed to load activity logs"}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No activity logs found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-green-600 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Activity List */}
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      {/* Activity Icon */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(log.activity_type)}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {getActivityBadge(log.activity_type)}
                          {getEntityBadge(log.entity_type)}
                          <span className="text-sm text-gray-500">
                            {formatDate(log.created_at)}
                          </span>
                        </div>

                        <p className="text-gray-900 font-medium mb-1">
                          {log.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{log.user_name}</span>
                          </div>
                          {log.entity_type === "work_order" && (
                            <button
                              onClick={() => handleViewWorkOrder(log.entity_id)}
                              className="flex items-center gap-1 text-green-600 hover:underline"
                            >
                              <Eye size={14} />
                              <span>View Work Order</span>
                            </button>
                          )}
                        </div>

                        {/* Activity Details */}
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                              View Details
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing page {pagination.page} of {pagination.totalPages}{" "}
                      ({pagination.total} total activities)
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= pagination.totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
