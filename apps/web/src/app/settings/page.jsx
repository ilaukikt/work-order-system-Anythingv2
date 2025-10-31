"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Home,
  Building2,
  Users,
  FileText,
  Settings,
  Save,
  User,
  Globe,
  Shield,
  Palette,
  Database,
  Activity,
} from "lucide-react";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    "work-orders": true,
  });
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    company_name: "Your Company",
    default_currency: "INR",
    default_tax_rate: 18,
    default_retention: 10,
    theme: "light",
    notifications_email: true,
    notifications_browser: true,
    auto_backup: true,
    backup_frequency: "daily",
  });

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to your backend
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "company", label: "Company", icon: Building2 },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "data", label: "Data", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex">
      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 border-r border-[#E4E8EE] ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} lg:block flex flex-col`}
      >
        <div className={`${sidebarOpen ? "block" : "hidden lg:block"}`}>
          <div className="sticky top-0 left-0 right-0 bg-[#0C8657] h-14 flex items-center justify-between px-4 z-50">
            <h1 className="text-xl font-semibold text-white mb-0">WorkOrder</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <div
              onClick={() => (window.location.href = "/dashboard")}
              className="flex items-center gap-3 px-3 py-2 text-[#5D667E] hover:bg-[#DFF3EA] hover:text-[#0C8657] rounded-lg cursor-pointer transition-colors"
            >
              <Home size={16} className="text-[#0C8657]" />
              {sidebarOpen && <span className="font-medium">Dashboard</span>}
            </div>

            <div
              onClick={() => (window.location.href = "/companies")}
              className="flex items-center gap-3 px-3 py-2 text-[#5D667E] hover:bg-[#DFF3EA] hover:text-[#0C8657] rounded-lg cursor-pointer transition-colors"
            >
              <Building2 size={16} className="text-[#0C8657]" />
              {sidebarOpen && <span className="font-medium">Companies</span>}
            </div>

            <div
              onClick={() => (window.location.href = "/vendors")}
              className="flex items-center gap-3 px-3 py-2 text-[#5D667E] hover:bg-[#DFF3EA] hover:text-[#0C8657] rounded-lg cursor-pointer transition-colors"
            >
              <Users size={16} className="text-[#0C8657]" />
              {sidebarOpen && <span className="font-medium">Vendors</span>}
            </div>

            <div>
              <div
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg transition-colors ${expandedMenus["work-orders"] ? "bg-[#DFF3EA]" : "hover:bg-[#DFF3EA]"}`}
                onClick={() => toggleMenu("work-orders")}
              >
                <FileText size={16} className="text-[#0C8657]" />
                {sidebarOpen && (
                  <>
                    <span className="font-semibold text-[#0C8657] flex-1">
                      Work Orders
                    </span>
                    {expandedMenus["work-orders"] ? (
                      <ChevronUp size={14} className="text-[#5D667E]" />
                    ) : (
                      <ChevronDown size={14} className="text-[#5D667E]" />
                    )}
                  </>
                )}
              </div>

              {expandedMenus["work-orders"] && sidebarOpen && (
                <div className="ml-6 mt-2 space-y-1 bg-[#DFF3EA] p-2 rounded-lg">
                  <div
                    onClick={() =>
                      (window.location.href = "/work-orders/create")
                    }
                    className="px-3 py-2 text-[#5D667E] text-sm cursor-pointer hover:text-[#0C8657] hover:bg-[#E9F6F1] rounded transition-colors"
                  >
                    Create Work Order
                  </div>
                  <div
                    onClick={() => (window.location.href = "/work-orders")}
                    className="px-3 py-2 text-[#5D667E] text-sm cursor-pointer hover:text-[#0C8657] hover:bg-[#E9F6F1] rounded transition-colors"
                  >
                    Work Order List
                  </div>
                  <div
                    onClick={() =>
                      (window.location.href = "/work-orders/pending-payments")
                    }
                    className="px-3 py-2 text-[#5D667E] text-sm cursor-pointer hover:text-[#0C8657] hover:bg-[#E9F6F1] rounded transition-colors"
                  >
                    Pending Payments
                  </div>
                </div>
              )}
            </div>

            <div
              onClick={() => (window.location.href = "/activity-logs")}
              className="flex items-center gap-3 px-3 py-2 text-[#5D667E] hover:bg-[#DFF3EA] hover:text-[#0C8657] rounded-lg cursor-pointer transition-colors"
            >
              <Activity size={16} className="text-[#0C8657]" />
              {sidebarOpen && <span className="font-medium">Activity Log</span>}
            </div>

            <div className="flex items-center gap-3 px-3 py-2 bg-[#DFF3EA] text-[#0C8657] rounded-lg">
              <Settings size={16} className="text-[#0C8657]" />
              {sidebarOpen && <span className="font-semibold">Settings</span>}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <header className="bg-[#0C8657] h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden hover:bg-white/10 p-2 rounded transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-semibold text-white">
              Work Order Management System
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative hover:bg-white/10 p-2 rounded transition-colors">
              <Bell size={24} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD83B] rounded-full"></div>
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
        <main className="flex-1 p-6 bg-[#F6F8FA]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#1F2739] mb-2">
                Settings
              </h1>
              <p className="text-[#5D667E]">
                Manage your application preferences and configuration
              </p>
            </div>

            {/* Settings Layout */}
            <div className="flex gap-6">
              {/* Settings Tabs */}
              <div className="w-64 bg-white rounded-lg border border-[#E4E8EE] p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-[#DFF3EA] text-[#0C8657]"
                            : "text-[#5D667E] hover:bg-[#F7FAFC] hover:text-[#1F2739]"
                        }`}
                      >
                        <IconComponent size={16} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1 bg-white rounded-lg border border-[#E4E8EE] p-6">
                {activeTab === "general" && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#1F2739] mb-6">
                      General Settings
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[#1F2739] mb-2">
                          Default Currency
                        </label>
                        <select
                          value={settings.default_currency}
                          onChange={(e) =>
                            handleSettingChange(
                              "default_currency",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-[#E4E8EE] rounded-lg bg-white text-[#1F2739] focus:outline-none focus:ring-2 focus:ring-[#0C8657]"
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1F2739] mb-2">
                          Default Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          value={settings.default_tax_rate}
                          onChange={(e) =>
                            handleSettingChange(
                              "default_tax_rate",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-[#E4E8EE] rounded-lg bg-white text-[#1F2739] focus:outline-none focus:ring-2 focus:ring-[#0C8657]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1F2739] mb-2">
                          Default Retention (%)
                        </label>
                        <select
                          value={settings.default_retention}
                          onChange={(e) =>
                            handleSettingChange(
                              "default_retention",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-[#E4E8EE] rounded-lg bg-white text-[#1F2739] focus:outline-none focus:ring-2 focus:ring-[#0C8657]"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={10}>10%</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "company" && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#1F2739] mb-6">
                      Company Settings
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[#1F2739] mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={settings.company_name}
                          onChange={(e) =>
                            handleSettingChange("company_name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-[#E4E8EE] rounded-lg bg-white text-[#1F2739] focus:outline-none focus:ring-2 focus:ring-[#0C8657]"
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-[#1F2739] mb-4">
                          Notifications
                        </h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.notifications_email}
                              onChange={(e) =>
                                handleSettingChange(
                                  "notifications_email",
                                  e.target.checked,
                                )
                              }
                              className="rounded border-[#E4E8EE] text-[#0C8657] focus:ring-[#0C8657]"
                            />
                            <span className="text-[#1F2739]">
                              Email Notifications
                            </span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.notifications_browser}
                              onChange={(e) =>
                                handleSettingChange(
                                  "notifications_browser",
                                  e.target.checked,
                                )
                              }
                              className="rounded border-[#E4E8EE] text-[#0C8657] focus:ring-[#0C8657]"
                            />
                            <span className="text-[#1F2739]">
                              Browser Notifications
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#1F2739] mb-6">
                      Security Settings
                    </h2>
                    <div className="space-y-6">
                      <div className="p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-lg">
                        <h3 className="font-medium text-[#92400E] mb-2">
                          Authentication Not Enabled
                        </h3>
                        <p className="text-sm text-[#92400E]">
                          User authentication is currently disabled. Enable it
                          in the project settings to access security features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#1F2739] mb-6">
                      Appearance Settings
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[#1F2739] mb-2">
                          Theme
                        </label>
                        <select
                          value={settings.theme}
                          onChange={(e) =>
                            handleSettingChange("theme", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-[#E4E8EE] rounded-lg bg-white text-[#1F2739] focus:outline-none focus:ring-2 focus:ring-[#0C8657]"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "data" && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#1F2739] mb-6">
                      Data Management
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-[#1F2739] mb-4">
                          Backup Settings
                        </h3>
                        <div className="space-y-4">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.auto_backup}
                              onChange={(e) =>
                                handleSettingChange(
                                  "auto_backup",
                                  e.target.checked,
                                )
                              }
                              className="rounded border-[#E4E8EE] text-[#0C8657] focus:ring-[#0C8657]"
                            />
                            <span className="text-[#1F2739]">
                              Enable Automatic Backups
                            </span>
                          </label>

                          <div>
                            <label className="block text-sm font-medium text-[#1F2739] mb-2">
                              Backup Frequency
                            </label>
                            <select
                              value={settings.backup_frequency}
                              onChange={(e) =>
                                handleSettingChange(
                                  "backup_frequency",
                                  e.target.value,
                                )
                              }
                              disabled={!settings.auto_backup}
                              className="w-full px-3 py-2 border border-[#E4E8EE] rounded-lg bg-white text-[#1F2739] focus:outline-none focus:ring-2 focus:ring-[#0C8657] disabled:bg-[#F7FAFC] disabled:text-[#9DA5BC]"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-[#E4E8EE]">
                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center gap-2 px-6 py-2 bg-[#0C8657] text-white rounded-lg hover:bg-[#0a6b47] transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
