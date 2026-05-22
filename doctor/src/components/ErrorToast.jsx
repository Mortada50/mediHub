import { useEffect } from "react";
export default function ErrorToast({ message, onClear }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClear, 3000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 left-4 z-50 max-w-sm mx-auto bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-xl px-4 py-3 text-center shadow-md">
      {message}
    </div>
  );
}
