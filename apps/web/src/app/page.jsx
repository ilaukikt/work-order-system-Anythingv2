"use client";

import { useState, useEffect } from "react";
import { BarChart3, FileText, Users, Building2, Plus } from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalWorkOrders: 0,
    totalCompanies: 0,
    totalVendors: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Mock data for bolt.new compatibility
        // In production, replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading

        setStats({
          totalWorkOrders: 15,
          totalCompanies: 8,
          totalVendors: 12,
          totalValue: 2450000,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Work Order Management Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Overview of your work order management system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Work Orders"
            value={stats.totalWorkOrders}
            icon={<FileText className="h-8 w-8" />}
            color="blue"
            onClick={() => handleNavigation("/work-orders")}
          />
          <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            icon={<Building2 className="h-8 w-8" />}
            color="green"
            onClick={() => handleNavigation("/companies")}
          />
          <StatCard
            title="Total Vendors"
            value={stats.totalVendors}
            icon={<Users className="h-8 w-8" />}
            color="purple"
            onClick={() => handleNavigation("/vendors")}
          />
          <StatCard
            title="Total Value"
            value={`₹${stats.totalValue.toLocaleString("en-IN")}`}
            icon={<BarChart3 className="h-8 w-8" />}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              onClick={() => handleNavigation("/work-orders/create")}
              title="Create Work Order"
              description="Generate a new work order"
              icon={<Plus className="h-6 w-6" />}
            />
            <QuickActionButton
              onClick={() => handleNavigation("/companies")}
              title="Manage Companies"
              description="Add or edit company details"
              icon={<Building2 className="h-6 w-6" />}
            />
            <QuickActionButton
              onClick={() => handleNavigation("/vendors")}
              title="Manage Vendors"
              description="Add or edit vendor information"
              icon={<Users className="h-6 w-6" />}
            />
            <QuickActionButton
              onClick={() => handleNavigation("/work-orders")}
              title="View All Work Orders"
              description="Browse all work orders"
              icon={<FileText className="h-6 w-6" />}
            />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold">Database</div>
              <div className="text-sm text-green-600">Connected</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold">API</div>
              <div className="text-sm text-blue-600">Operational</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold">Services</div>
              <div className="text-sm text-purple-600">All Systems Go</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              No recent activity to display
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Activity logs will appear here as you use the system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ onClick, title, description, icon }) {
  return (
    <div
      onClick={onClick}
      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start">
        <div className="text-blue-600 mr-3 mt-1">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
