import { AlertTriangle, RefreshCw,LoaderIcon } from "lucide-react";

export default function TableErrorUI({ colSpan = 5, message, onRetry, onloading }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center gap-3 py-14">
          <div className="size-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="size-8 text-red-400" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-gray-500 font-semibold text-sm">
              حدث خطأ أثناء تحميل البيانات
            </p>
            <p className="text-gray-300 text-xs">
              {message || "تعذّر الاتصال بالخادم، يرجى المحاولة مجدداً"}
            </p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 mt-1 px-4 h-[34px] rounded-lg border border-gray-200 text-gray-400 text-xs font-semibold hover:border-primary hover:text-primary transition-colors cursor-pointer">
              {onloading ? (
                <LoaderIcon className="size-7 animate-spin" />
              ) : (
                <>
                  <RefreshCw size={13} />
                  إعادة المحاولة
                </>
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
