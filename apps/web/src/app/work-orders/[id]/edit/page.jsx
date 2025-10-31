"use client";
import React from "react";
import { useEditWorkOrder } from "@/hooks/useEditWorkOrder";
import { EditWorkOrderHeader } from "@/components/work-orders/EditWorkOrderHeader";
import { BasicInfoSection } from "@/components/work-orders/BasicInfoSection";
import { VendorDetailsSection } from "@/components/work-orders/VendorDetailsSection";
import { ProjectDetailsSection } from "@/components/work-orders/ProjectDetailsSection";
import { FinancialDetailsSection } from "@/components/work-orders/FinancialDetailsSection";
import { PaymentDetailsSection } from "@/components/work-orders/PaymentDetailsSection";
import { ActionButtons } from "@/components/work-orders/ActionButtons";
import { CompanyDetailsSidebar } from "@/components/work-orders/CompanyDetailsSidebar";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { FullScreenError } from "@/components/FullScreenError";
import { Notification } from "@/components/Notification";

export default function EditWorkOrderPage({ params }) {
  const { id } = params;
  const {
    formData,
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
  } = useEditWorkOrder(id);

  if (isOrderLoading) {
    return <FullScreenLoader />;
  }

  if (orderError || !workOrder) {
    return (
      <FullScreenError
        message={orderError?.message || "Work order not found"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212]">
      <EditWorkOrderHeader
        workOrderId={id}
        workOrderNumber={formData.wo_number}
      />

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              <BasicInfoSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleCompanyChange={handleCompanyChange}
                companies={companies}
              />
              <VendorDetailsSection
                formData={formData}
                handleInputChange={handleInputChange}
              />
              <ProjectDetailsSection
                formData={formData}
                handleInputChange={handleInputChange}
              />
              <FinancialDetailsSection
                formData={formData}
                calculatedAmounts={calculatedAmounts}
                handleInputChange={handleInputChange}
                handleGstChange={handleGstChange}
              />
              <PaymentDetailsSection
                formData={formData}
                handleInputChange={handleInputChange}
              />
              <ActionButtons id={id} isPending={updateMutation.isPending} />
            </form>
          </div>
          <CompanyDetailsSidebar company={selectedCompany} />
        </div>

        {showSuccess && (
          <Notification message="Work Order updated successfully!" />
        )}

        {updateMutation.error && (
          <Notification message={updateMutation.error.message} type="error" />
        )}
      </main>
    </div>
  );
}
