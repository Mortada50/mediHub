import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

export default function UpdatePriceModal({ med, onClose, onUpdate, isLoading }) {
  const [price, setPrice] = useState('');

  // Sync state if med changes
  useEffect(() => {
    if (med) {
      setPrice(med.price || '');
    }
  }, [med]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (price !== '' && !isLoading) {
      onUpdate(med.pharmacyMedId || med._id, Number(price));
    }
  };

  if (!med) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-[slideUp_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-[#4A7CF6] font-bold">
            <Tag size={20} />
            <h3 className="text-lg">تعديل سعر الدواء</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
              <img
                src={med.images?.[0] || 'https://cdn-icons-png.flaticon.com/128/4766/4766295.png'}
                alt={med.englishName}
                className="w-9 h-9 object-contain opacity-80"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-gray-800 text-[14px] leading-tight truncate" dir="ltr">
                {med.englishName}
              </span>
              <span className="text-xs text-gray-500 mt-0.5 truncate">{med.arabicName}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              السعر الجديد (ريال)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="أدخل السعر الجديد..."
              className="w-full h-11 bg-white rounded-xl px-4 text-sm text-gray-800 border border-gray-200 focus:outline-none focus:border-[#4A7CF6] focus:ring-1 focus:ring-[#4A7CF6] transition-all font-semibold"
              min="0"
              required
              disabled={isLoading}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl font-bold text-white bg-[#4A7CF6] hover:bg-[#4A7CF6]/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التعديل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
