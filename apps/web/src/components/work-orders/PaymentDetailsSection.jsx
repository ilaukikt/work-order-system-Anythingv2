import React from "react";
import { CreditCard } from "lucide-react";
import { FormInput, FormSelect } from "./FormControls";

export function PaymentDetailsSection({ formData, handleInputChange }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={20} className="text-[#0C8657] dark:text-[#22C55E]" />
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Payment & Bank Details
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormSelect
          label="Payment Terms"
          name="payment_terms"
          value={formData.payment_terms}
          onChange={handleInputChange}
        >
          <option value="">Select Payment Terms</option>
          <option value="100% Advance">100% Advance</option>
          <option value="After Completion">After Completion</option>
          <option value="50% Advance + 50% After">
            50% Advance + 50% After
          </option>
        </FormSelect>

        <FormInput
          label="Vendor Bank Name"
          name="vendor_bank_name"
          value={formData.vendor_bank_name}
          onChange={handleInputChange}
        />
        <FormInput
          label="Vendor Bank Account No."
          name="vendor_bank_account"
          value={formData.vendor_bank_account}
          onChange={handleInputChange}
        />
        <FormInput
          label="Vendor Bank IFSC"
          name="vendor_bank_ifsc"
          value={formData.vendor_bank_ifsc}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
