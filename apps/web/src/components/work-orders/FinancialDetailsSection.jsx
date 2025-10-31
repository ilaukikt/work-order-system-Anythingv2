import React from "react";
import { Calculator } from "lucide-react";
import { FormInput, FormSelect } from "./FormControls";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export function FinancialDetailsSection({
  formData,
  calculatedAmounts,
  handleInputChange,
  handleGstChange,
}) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={20} className="text-[#0C8657] dark:text-[#22C55E]" />
        <h2 className="text-lg font-semibold text-[#1F2739] dark:text-[#FFFFFF]">
          Financial Details
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Total Amount (Before Tax) *"
          type="number"
          step="0.01"
          name="total_amount"
          value={formData.total_amount}
          onChange={handleInputChange}
          required
        />
        <FormSelect
          label="GST Applicable"
          name="has_gst"
          value={formData.has_gst}
          onChange={handleGstChange}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </FormSelect>

        {formData.has_gst && (
          <>
            <FormSelect
              label="SGST %"
              name="sgst_percent"
              value={formData.sgst_percent}
              onChange={handleInputChange}
            >
              <option value={0}>0%</option>
              <option value={2.5}>2.5%</option>
              <option value={6}>6%</option>
              <option value={9}>9%</option>
              <option value={14}>14%</option>
            </FormSelect>

            <FormSelect
              label="CGST %"
              name="cgst_percent"
              value={formData.cgst_percent}
              onChange={handleInputChange}
            >
              <option value={0}>0%</option>
              <option value={2.5}>2.5%</option>
              <option value={6}>6%</option>
              <option value={9}>9%</option>
              <option value={14}>14%</option>
            </FormSelect>
          </>
        )}

        <FormSelect
          label="Retention %"
          name="retention_percent"
          value={formData.retention_percent}
          onChange={handleInputChange}
        >
          <option value={0}>0%</option>
          <option value={5}>5%</option>
          <option value={10}>10%</option>
        </FormSelect>
      </div>

      <div className="mt-6 p-4 bg-[#F7FAFC] dark:bg-[#262626] rounded-lg">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {formData.has_gst && (
            <>
              <div className="flex justify-between">
                <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                  SGST ({formData.sgst_percent}%):
                </span>
                <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                  {formatCurrency(calculatedAmounts.sgst_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                  CGST ({formData.cgst_percent}%):
                </span>
                <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                  {formatCurrency(calculatedAmounts.cgst_amount)}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-[#5D667E] dark:text-[#B0B0B0]">
              Gross Amount:
            </span>
            <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
              {formatCurrency(calculatedAmounts.gross_amount)}
            </span>
          </div>
          {formData.retention_percent > 0 && (
            <div className="flex justify-between">
              <span className="text-[#5D667E] dark:text-[#B0B0B0]">
                Retention Amount:
              </span>
              <span className="text-[#1F2739] dark:text-[#FFFFFF] font-medium">
                {formatCurrency(calculatedAmounts.retention_amount)}
              </span>
            </div>
          )}
        </div>
        <hr className="my-3 border-[#E4E8EE] dark:border-[#333333]" />
        <div className="flex justify-between text-lg font-bold">
          <span className="text-[#1F2739] dark:text-[#FFFFFF]">
            Net Amount:
          </span>
          <span className="text-[#0C8657] dark:text-[#22C55E]">
            {formatCurrency(calculatedAmounts.net_amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
