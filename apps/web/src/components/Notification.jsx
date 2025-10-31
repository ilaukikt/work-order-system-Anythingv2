import React from "react";
import { CheckCircle2 } from "lucide-react";

export function Notification({ message, type = "success" }) {
  const successClasses = "bg-[#10B981] dark:bg-[#059669]";
  const errorClasses = "bg-[#EF4444] dark:bg-[#DC2626]";
  const bgColor = type === "success" ? successClasses : errorClasses;

  return (
    <div
      className={`fixed bottom-6 right-6 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${bgColor}`}
    >
      {type === "success" && <CheckCircle2 size={20} />}
      <span>{message}</span>
    </div>
  );
}
