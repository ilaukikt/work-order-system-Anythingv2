"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Home,
  Building2,
  Users,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CompaniesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    "work-orders": true,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
    contact_person: "",
    contact_number: "",
    gst_number: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc: "",
  });
  const queryClient = useQueryClient();

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Fetch companies
  const {
    data: companiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      return response.json();
    },
  });

  // Create company mutation
  const createMutation = useMutation({
    mutationFn: async (companyData) => {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create company");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
      setShowAddForm(false);
      resetForm();
    },
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update company");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
      setEditingCompany(null);
      resetForm();
    },
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete company");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
    },
  });

  const companies = companiesData?.companies || [];

  const resetForm = () => {
    setFormData({
      company_name: "",
      address: "",
      contact_person: "",
      contact_number: "",
      gst_number: "",
      bank_name: "",
      bank_account_number: "",
      bank_ifsc: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      company_name: company.company_name || "",
      address: company.address || "",
      contact_person: company.contact_person || "",
      contact_number: company.contact_number || "",
      gst_number: company.gst_number || "",
      bank_name: company.bank_name || "",
      bank_account_number: company.bank_account_number || "",
      bank_ifsc: company.bank_ifsc || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = (company) => {
    if (
      window.confirm(`Are you sure you want to delete ${company.company_name}?`)
    ) {
      deleteMutation.mutate(company.id);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingCompany(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex">
      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white dark:bg-[#1E1E1E] transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 border-r border-[#E4E8EE] dark:border-[#333333] ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} lg:block flex flex-col`}
      >
        <div className={`${sidebarOpen ? "block" : "hidden lg:block"}`}>
          <div className="sticky top-0 left-0 right-0 bg-[#0C8657] dark:bg-[#0C8657] h-14 flex items-center justify-between px-4 z-50">
            <h1 className="text-xl font-semibold text-white mb-0">WorkOrder</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/80 hover:text-white active:text-white/60 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        <div
          className={`${sidebarOpen ? "hidden" : "block"} p-4 border-b border-[#E4E8EE] dark:border-[#333333] hidden lg:block`}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#9DA5BC] dark:text-[#888888] hover:text-[#5D667E] dark:hover:text-[#B0B0B0] active:text-[#1F2739] dark:active:text-[#FFFFFF] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <div
              onClick={() => (window.location.href = "/dashboard")}
              className="flex items-center gap-3 px-3 py-2 text-[#5D667E] dark:text-[#B0B0B0] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20 active:bg-[#D1F0DD] dark:active:bg-[#0C8657]/30 hover:text-[#0C8657] dark:hover:text-[#22C55E] rounded-lg cursor-pointer transition-colors"
            >
              <Home size={16} className="text-[#0C8657] dark:text-[#22C55E]" />
              {sidebarOpen && <span className="font-medium">Dashboard</span>}
            </div>

            <div className="flex items-center gap-3 px-3 py-2 bg-[#DFF3EA] dark:bg-[#0C8657]/20 text-[#0C8657] dark:text-[#22C55E] rounded-lg">
              <Building2
                size={16}
                className="text-[#0C8657] dark:text-[#22C55E]"
              />
              {sidebarOpen && <span className="font-semibold">Companies</span>}
            </div>

            <div>
              <div
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg transition-colors ${expandedMenus["work-orders"] ? "bg-[#DFF3EA] dark:bg-[#0C8657]/20" : "hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20 active:bg-[#D1F0DD] dark:active:bg-[#0C8657]/30"}`}
                onClick={() => toggleMenu("work-orders")}
              >
                <FileText
                  size={16}
                  className="text-[#0C8657] dark:text-[#22C55E]"
                />
                {sidebarOpen && (
                  <>
                    <span className="font-semibold text-[#0C8657] dark:text-[#22C55E] flex-1">
                      Work Orders
                    </span>
                    {expandedMenus["work-orders"] ? (
                      <ChevronUp
                        size={14}
                        className="text-[#5D667E] dark:text-[#B0B0B0]"
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                        className="text-[#5D667E] dark:text-[#B0B0B0]"
                      />
                    )}
                  </>
                )}
              </div>

              {expandedMenus["work-orders"] && sidebarOpen && (
                <div className="ml-6 mt-2 space-y-1 bg-[#DFF3EA] dark:bg-[#0C8657]/20 p-2 rounded-lg">
                  <div
                    onClick={() =>
                      (window.location.href = "/work-orders/create")
                    }
                    className="px-3 py-2 text-[#5D667E] dark:text-[#B0B0B0] text-sm cursor-pointer hover:text-[#0C8657] dark:hover:text-[#22C55E] hover:bg-[#E9F6F1] dark:hover:bg-[#0C8657]/30 active:bg-[#D1F0DD] dark:active:bg-[#0C8657]/40 rounded transition-colors"
                  >
                    Create Work Order
                  </div>
                  <div
                    onClick={() => (window.location.href = "/work-orders")}
                    className="px-3 py-2 text-[#5D667E] dark:text-[#B0B0B0] text-sm cursor-pointer hover:text-[#0C8657] dark:hover:text-[#22C55E] hover:bg-[#E9F6F1] dark:hover:bg-[#0C8657]/30 active:bg-[#D1F0DD] dark:active:bg-[#0C8657]/40 rounded transition-colors"
                  >
                    Work Order List
                  </div>
                  <div className="px-3 py-2 text-[#5D667E] dark:text-[#B0B0B0] text-sm cursor-pointer hover:text-[#0C8657] dark:hover:text-[#22C55E] hover:bg-[#E9F6F1] dark:hover:bg-[#0C8657]/30 active:bg-[#D1F0DD] dark:active:bg-[#0C8657]/40 rounded transition-colors">
                    Pending Payments
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-3 py-2 text-[#5D667E] dark:text-[#B0B0B0] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20 active:bg-[#D1F0DD] dark:active:bg-[#0C8657]/30 hover:text-[#0C8657] dark:hover:text-[#22C55E] rounded-lg cursor-pointer transition-colors">
              <Users size={16} className="text-[#0C8657] dark:text-[#22C55E]" />
              {sidebarOpen && (
                <span className="font-medium flex-1">Vendors</span>
              )}
            </div>

            <div className="flex items-center gap-3 px-3 py-2 text-[#5D667E] dark:text-[#B0B0B0] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20 active:bg-[#D1F0DD] dark:active:bg-[#0C8657]/30 hover:text-[#0C8657] dark:hover:text-[#22C55E] rounded-lg cursor-pointer transition-colors">
              <Settings
                size={16}
                className="text-[#0C8657] dark:text-[#22C55E]"
              />
              {sidebarOpen && (
                <span className="font-medium flex-1">Settings</span>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <header className="bg-[#0C8657] dark:bg-[#0C8657] h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 p-2 rounded transition-colors"
              onClick={() => setSidebarOpen(true)}
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
            <button className="relative hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 p-2 rounded transition-colors">
              <Bell size={24} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD83B] dark:bg-[#FCD34D] rounded-full"></div>
            </button>

            <button className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 px-3 py-2 rounded transition-colors">
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
        <main className="flex-1 p-6 bg-[#F6F8FA] dark:bg-[#121212]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
              Company Master
            </h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] transition-colors"
            >
              <Plus size={16} />
              <span>Add New Company</span>
            </button>
          </div>

          {/* Companies Table */}
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
                    {error.message}
                  </p>
                </div>
              </div>
            ) : companies.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2
                    size={32}
                    className="text-[#9DA5BC] dark:text-[#888888] mx-auto mb-2"
                  />
                  <p className="text-[#5D667E] dark:text-[#B0B0B0]">
                    No companies found
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#F7FAFC] dark:bg-[#262626] border-b border-[#E4E8EE] dark:border-[#333333]">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Company Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Contact Person
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Contact Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#5D667E] dark:text-[#B0B0B0]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-[#E4E8EE] dark:border-[#333333] hover:bg-[#F7FAFC] dark:hover:bg-[#262626] transition-colors"
                    >
                      <td className="py-3 px-4 text-[#1F2739] dark:text-[#FFFFFF]">
                        {company.company_name}
                      </td>
                      <td className="py-3 px-4 text-[#5D667E] dark:text-[#B0B0B0]">
                        {company.contact_person || "-"}
                      </td>
                      <td className="py-3 px-4 text-[#5D667E] dark:text-[#B0B0B0]">
                        {company.contact_number || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(company)}
                            className="p-1 text-[#0C8657] dark:text-[#22C55E] hover:bg-[#DFF3EA] dark:hover:bg-[#0C8657]/20 rounded transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(company)}
                            className="p-1 text-[#E95D5D] dark:text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#EF4444]/20 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Company Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
                {editingCompany ? "Edit Company" : "Add New Company"}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1 text-[#5D667E] dark:text-[#B0B0B0] hover:text-[#1F2739] dark:hover:text-[#FFFFFF] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
                  Bank IFSC
                </label>
                <input
                  type="text"
                  name="bank_ifsc"
                  value={formData.bank_ifsc}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-[#E4E8EE] dark:border-[#333333] text-[#5D667E] dark:text-[#B0B0B0] rounded-lg hover:bg-[#F7FAFC] dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save</span>
                </button>
              </div>
            </form>

            {(createMutation.error || updateMutation.error) && (
              <div className="mt-4 p-3 bg-[#FEF2F2] dark:bg-[#EF4444]/20 border border-[#FCA5A5] dark:border-[#EF4444]/30 rounded-lg">
                <p className="text-sm text-[#E95D5D] dark:text-[#EF4444]">
                  {createMutation.error?.message ||
                    updateMutation.error?.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
