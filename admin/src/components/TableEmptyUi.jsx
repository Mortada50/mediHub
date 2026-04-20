import { SearchX, Inbox } from "lucide-react";

export default function TableEmptyUI({
  isSearching = false,
  colSpan = 5,
  message,
  messageSubTitle
}) {
  const icon = isSearching ? (
    <SearchX className="size-10 text-gray-300" strokeWidth={1.5} />
  ) : (
    <Inbox className="size-10 text-gray-300" strokeWidth={1.5} />
  );

  const title =  isSearching
      ? "لا توجد نتائج للبحث"
      : message;

  const subtitle = isSearching
    ? "جرّب كلمة بحث مختلفة أو تحقق من الفلاتر"
    : messageSubTitle;

  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center gap-3 py-14">
          <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center">
            {icon}
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-gray-500 font-semibold text-sm">{title}</p>
            <p className="text-gray-400 text-xs">{subtitle}</p>
          </div>
        </div>
      </td>
    </tr>
  );
}
