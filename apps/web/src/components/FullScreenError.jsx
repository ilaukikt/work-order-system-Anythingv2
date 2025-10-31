import React from "react";
import { AlertCircle } from "lucide-react";

export function FullScreenError({ message }) {
  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle
          size={32}
          className="text-[#E95D5D] dark:text-[#EF4444] mx-auto mb-2"
        />
        <p className="text-[#5D667E] dark:text-[#B0B0B0]">{message}</p>
      </div>
    </div>
  );
}
