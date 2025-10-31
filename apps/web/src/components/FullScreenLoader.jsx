import React from "react";
import { Loader2 } from "lucide-react";

export function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex items-center justify-center">
      <Loader2
        size={32}
        className="text-[#0C8657] dark:text-[#22C55E] animate-spin"
      />
    </div>
  );
}
