import { AlertCircle } from "lucide-react";
import React from "react";

function InputsError({ error }) {
  return (
    <div className="text-sm mt-1 flex items-center justify-start gap-1 pr-1">
      <AlertCircle className="size-[16px] text-red-600" />
      <span className="text-sm text-gray-600">{error}</span>
    </div>
  );
}

export default InputsError;
