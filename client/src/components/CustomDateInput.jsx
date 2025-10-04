import React, { forwardRef } from 'react';
import { format } from "date-fns";

const CustomDateInput = forwardRef(({ value, onClick, label, placeholder }, ref) => {
    const dateObj = value ? new Date(value) : null;

    return (
      <div
        onClick={onClick}
        ref={ref}
        className="col-span-1 rounded-lg px-3 py-2 cursor-pointer"
      >
        <label className="block text-xs font-medium text-indigo-900">{label}</label>

        {dateObj ? (
          <div>
            <div className="text-xl font-bold">
              {format(dateObj, "d")}{" "}
              <span className="text-sm font-medium">{format(dateObj, "MMM''yy")}</span>
            </div>
            <div className="text-sm text-gray-600">{format(dateObj, "EEEE")}</div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">{placeholder}</div>
        )}
      </div>
    );
  });

export default CustomDateInput