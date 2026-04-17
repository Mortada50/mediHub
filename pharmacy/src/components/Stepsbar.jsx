export default function Stepsbar({ steps, current }) {
  return (
    <div className="flex items-center justify-between w-full mt-5 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const isCompleted = num < current;
        const isActive = num === current;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* الدائرة + النص */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div
                className={`
                  flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 
                  rounded-full border-2 text-xs sm:text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted ? "bg-teal-600 border-teal-600 text-white" : ""}
                  ${isActive ? "border-teal-600 text-teal-600" : ""}
                  ${!isCompleted && !isActive ? "border-gray-300 text-gray-400" : ""}
                `}>
                {isCompleted ? "✓" : num}
              </div>

              <span
                className={`
                  text-xs sm:text-sm whitespace-nowrap
                  ${isActive ? "text-teal-600 font-semibold" : "text-gray-400"}
                `}>
                {label}
              </span>
            </div>

            {/* الخط الفاصل */}
            {i !== steps.length - 1 && (
              <div
                className={`
                  flex-1 h-[2px] mx-1 sm:mx-2 min-w-[10px] transition-all duration-300
                  ${num < current ? "bg-teal-600" : "bg-gray-300"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
