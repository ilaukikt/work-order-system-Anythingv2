import React from "react";
import { Save, Loader2 } from "lucide-react";

export function ActionButtons({ id, isPending }) {
  return (
    <div className="flex gap-4 pt-6">
      <button
        type="button"
        onClick={() => (window.location.href = `/work-orders/${id}`)}
        className="flex-1 px-6 py-3 border border-[#E4E8EE] dark:border-[#333333] text-[#5D667E] dark:text-[#B0B0B0] rounded-lg hover:bg-[#F7FAFC] dark:hover:bg-[#262626] transition-colors"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isPending}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0C8657] dark:bg-[#059669] text-white rounded-lg hover:bg-[#0a6b47] dark:hover:bg-[#047857] disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Save size={20} />
        )}
        <span>Update Work Order</span>
      </button>
    </div>
  );
}
