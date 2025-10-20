import { forwardRef } from "react";

const CustomAirportInput = forwardRef(({ value, onClick, placeholder }, ref) => {
  if (!value) {
    return (
      <div
        onClick={onClick}
        ref={ref}
        className="cursor-pointer px-3 py-2 rounded-md border bg-white"
      >
        <span className="text-gray-400 text-sm">{placeholder}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      ref={ref}
      className="cursor-pointer px-3 py-2 rounded-md border border-gray-300 bg-white"
    >
      <div className="text-lg font-bold text-indigo-950">{value.city}</div>
      <div className="text-sm text-indigo-950">
        {value.code}, {value.name}
      </div>
    </div>
  );
});

export default CustomAirportInput;
