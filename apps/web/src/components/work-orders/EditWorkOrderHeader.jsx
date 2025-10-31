import React from "react";
import { ArrowLeft } from "lucide-react";

export function EditWorkOrderHeader({ workOrderNumber, workOrderId }) {
  return (
    <header className="bg-[#0C8657] dark:bg-[#0C8657] h-14 flex items-center px-4 sm:px-6 text-white sticky top-0 z-30">
      <button
        onClick={() => (window.location.href = `/work-orders/${workOrderId}`)}
        className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-white/10 active:bg-white/20 dark:active:bg-white/20 px-2 py-1 rounded transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:block">Back</span>
      </button>
      <h1 className="text-xl font-semibold ml-4">
        Edit Work Order - {workOrderNumber}
      </h1>
    </header>
  );
}
