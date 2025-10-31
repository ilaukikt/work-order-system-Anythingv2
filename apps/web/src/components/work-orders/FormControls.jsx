import React from "react";

const commonClasses =
  "w-full px-3 py-2 border border-[#E4E8EE] dark:border-[#333333] rounded-lg bg-white dark:bg-[#262626] text-[#1F2739] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0C8657] dark:focus:ring-[#22C55E]";

export function FormInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
        {label}
      </label>
      <input {...props} className={commonClasses} />
    </div>
  );
}

export function FormSelect({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
        {label}
      </label>
      <select {...props} className={commonClasses}>
        {children}
      </select>
    </div>
  );
}

export function FormTextArea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2739] dark:text-[#FFFFFF] mb-1">
        {label}
      </label>
      <textarea {...props} className={commonClasses} />
    </div>
  );
}
