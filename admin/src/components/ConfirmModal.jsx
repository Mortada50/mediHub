import {
  AlertTriangle,
  Info,
  CheckCircle,
  Trash2,
  X,
  LoaderIcon,
} from "lucide-react";
import { useState } from "react";

const VARIANTS = {
  danger: {
    icon: <Trash2 className="size-6 text-red-500" strokeWidth={1.5} />,
    iconBg: "bg-red-50",
    confirmBtn: "bg-red-500 hover:bg-red-600 text-white",
    confirmLabel: "حذف",
  },
  warning: {
    icon: (
      <AlertTriangle className="size-6 text-yellow-500" strokeWidth={1.5} />
    ),
    iconBg: "bg-yellow-50",
    confirmBtn: "bg-yellow-500 hover:bg-yellow-600 text-white",
    confirmLabel: "تأكيد",
  },
  info: {
    icon: <Info className="size-6 text-blue-500" strokeWidth={1.5} />,
    iconBg: "bg-blue-50",
    confirmBtn: "bg-primary hover:bg-primary/90 text-white",
    confirmLabel: "تأكيد",
  },
  success: {
    icon: <CheckCircle className="size-6 text-green-500" strokeWidth={1.5} />,
    iconBg: "bg-green-50",
    confirmBtn: "bg-green-500 hover:bg-green-600 text-white",
    confirmLabel: "تأكيد",
  },
};

export default function ConfirmModal({
  title,
  message,
  variant = "danger",
  confirmLabel,
  cancelLabel = "إلغاء",
  onConfirm,
  onClose,
  loading
}) {
  // const [loading, setLoading] = useState(false);
  const v = VARIANTS[variant] ?? VARIANTS.danger;

  // const handleConfirm = async () => {
  //   setLoading(true);
  //   try {
  //     await onConfirm();
  //   } finally {
  //     setLoading(false);
  //     onClose();
  //   }
  // };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div
            className={`size-11 rounded-full ${v.iconBg} flex items-center justify-center shrink-0`}>
            {v.icon}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 pb-6 flex flex-col gap-1 text-right">
          <h2 className="text-gray-800 font-black text-base">{title}</h2>
          {message && (
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => onConfirm()}
            disabled={loading}
            className={`flex-1 h-[40px] rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${v.confirmBtn}`}>
            {loading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              (confirmLabel ?? v.confirmLabel)
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-[40px] rounded-lg border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
