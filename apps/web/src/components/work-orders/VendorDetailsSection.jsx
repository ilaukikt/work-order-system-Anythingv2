import React from "react";
import { User } from "lucide-react";
import { FormInput, FormTextArea } from "./FormControls";

export function VendorDetailsSection({ formData, handleInputChange }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
      <div className="flex items-center gap-2 mb-4">
        <User size={20} className="text-[#0C8657] dark:text-[#22C55E]" />
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Vendor Details
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Vendor Name *"
          name="vendor_name"
          value={formData.vendor_name}
          onChange={handleInputChange}
          required
        />
        <FormInput
          label="Vendor Contact Number"
          type="tel"
          name="vendor_contact"
          value={formData.vendor_contact}
          onChange={handleInputChange}
        />
        <FormTextArea
          label="Vendor Address"
          name="vendor_address"
          value={formData.vendor_address}
          onChange={handleInputChange}
          rows={3}
        />
        <FormInput
          label="Vendor GST No. (Optional)"
          name="vendor_gst"
          value={formData.vendor_gst}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
