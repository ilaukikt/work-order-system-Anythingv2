import React from "react";
import { MapPin } from "lucide-react";
import { FormInput, FormTextArea } from "./FormControls";

export function ProjectDetailsSection({ formData, handleInputChange }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={20} className="text-[#0C8657] dark:text-[#22C55E]" />
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Project Details
        </h2>
      </div>
      <div className="space-y-4">
        <FormInput
          label="Site Name *"
          name="site_name"
          value={formData.site_name}
          onChange={handleInputChange}
          required
        />
        <FormInput
          label="Project Description"
          name="project_description"
          value={formData.project_description}
          onChange={handleInputChange}
        />
        <FormTextArea
          label="Description of Work *"
          name="work_description"
          value={formData.work_description}
          onChange={handleInputChange}
          required
          rows={6}
          placeholder="Detailed description of the work to be performed..."
        />
      </div>
    </div>
  );
}
