import React from "react";
import { Building2 } from "lucide-react";
import { FormInput, FormSelect } from "./FormControls";

export function BasicInfoSection({
  formData,
  handleInputChange,
  handleCompanyChange,
  companies,
}) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={20} className="text-[#0C8657] dark:text-[#22C55E]" />
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Basic Information
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormSelect
          label="Company *"
          name="company_id"
          value={formData.company_id}
          onChange={handleCompanyChange}
          required
        >
          <option value="">Select Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.company_name}
            </option>
          ))}
        </FormSelect>

        <FormInput
          label="Date *"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />

        <div className="md:col-span-2">
          <FormInput
            label="Work Order Number"
            name="wo_number"
            value={formData.wo_number}
            onChange={handleInputChange}
          />
        </div>

        <FormSelect
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </FormSelect>
      </div>
    </div>
  );
}
