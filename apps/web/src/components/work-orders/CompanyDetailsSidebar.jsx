import React from "react";
import { Building2 } from "lucide-react";

export function CompanyDetailsSidebar({ company }) {
  if (!company) return null;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6 sticky top-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-[#0C8657] dark:text-[#22C55E]" />
          <h3 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
            Company Details
          </h3>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-[#1F2739] dark:text-[#FFFFFF]">
              {company.company_name}
            </span>
          </div>

          {company.address && (
            <div>
              <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                Address:
              </span>
              <p className="text-[#1F2739] dark:text-[#FFFFFF] mt-1">
                {company.address}
              </p>
            </div>
          )}

          {company.contact_person && (
            <div>
              <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                Contact Person:
              </span>
              <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                {company.contact_person}
              </p>
            </div>
          )}

          {company.contact_number && (
            <div>
              <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                Contact:
              </span>
              <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                {company.contact_number}
              </p>
            </div>
          )}

          {company.gst_number && (
            <div>
              <span className="text-[#5D667E] dark:text-[#B0B0B0]">GST:</span>
              <p className="text-[#1F2739] dark:text-[#FFFFFF]">
                {company.gst_number}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
