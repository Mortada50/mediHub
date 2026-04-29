import React from 'react'
import { XCircle } from "lucide-react";



function ErrorUIDialog({ title, message, onClose, error = null }) {
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
      <div className="flex flex-col items-center justify-center gap-3 bg-white border border-red-100 shadow-lg rounded-2xl px-8 py-6 size-[300px]">
        <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="size-6 text-red-500" />
        </div>
        <p className="text-gray-700 font-semibold text-sm">{title}</p>
        <p className="text-gray-500 text-xs text-center">
          {message ||error?.message}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="mt-1 px-5 h-[36px] rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer">
          إغلاق
        </button>
      </div>
    </div>
  );
}

export default ErrorUIDialog