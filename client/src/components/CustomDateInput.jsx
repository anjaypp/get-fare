import React, { forwardRef } from "react";
import { format } from "date-fns";

const CustomDateInput = forwardRef(
  ({ value, onClick, label, placeholder, size = "default" }, ref) => {
    const dateObj = value ? new Date(value) : null;

    const dayClass =
      size === "summary" ? "text-lg font-bold" : "text-[28px] font-bold";
    const monthClass =
      size === "summary" ? "text-lg font-bold" : "text-[28px] font-bold";
    const weekdayClass = "text-sm";

    return (
      <div
        onClick={onClick}
        ref={ref}
        className="col-span-1 rounded-lg px-3 py-2 cursor-pointer"
      >
        <label className="block text-xs font-medium text-indigo-950 mb-2">
          {label}
        </label>

        {dateObj ? (
          size === "summary" ? (
            <div className="flex items-baseline gap-2 text-indigo-950">
              <span className={dayClass}>{format(dateObj, "d")}</span>
              <span className={monthClass}>{format(dateObj, "MMM''yy")}</span>
              <span className={weekdayClass}>{format(dateObj, "EEEE")}</span>
            </div>
          ) : (
            <div>
              <div className={`flex items-baseline gap-1 text-indigo-950`}>
                <span className={dayClass}>{format(dateObj, "d")}</span>
                <span className={monthClass}>{format(dateObj, "MMM''yy")}</span>
              </div>
              <div className={`${weekdayClass} text-indigo-950`}>
                {format(dateObj, "EEEE")}
              </div>
            </div>
          )
        ) : (
          <div className="text-sm text-gray-400">{placeholder}</div>
        )}
      </div>
    );
  }
);

export default CustomDateInput;
