import { useEffect, useState, useCallback } from "react";
import { Combobox } from "@headlessui/react";
import axiosClient from "../../axios-client";
import { debounce } from "lodash";

const AutocompleteSelect = ({
  type,
  onSelect,
  placeholder,
  value, // Current selected value
  hideSelectedInInput = false,
  size = "default", // "default" or "summary"
}) => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const endpoint = type === "airport" ? "/airports" : "/airlines";

  // Initialize component with default value
  useEffect(() => {
    if (value && value !== selectedItem) {
      setSelectedItem(value);
    }
  }, [value, selectedItem]);

  // Fetch logic
  const fetchItems = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 2) {
        setItems([]);
        return;
      }

      setIsLoading(true);
      try {
        const trimmedQuery = searchQuery.trim();
        const { data } = await axiosClient.get(
          `${endpoint}?query=${trimmedQuery}`,
          {
            headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
          }
        );
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(`Error fetching ${type}s:`, err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [endpoint, type]
  );

  useEffect(() => {
    if (query.length >= 2) {
      fetchItems(query);
    } else {
      setItems([]);
    }

    return () => fetchItems.cancel?.();
  }, [query, fetchItems]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSelect = (item) => {
    if (item) {
      setSelectedItem(item);
      setQuery("");
      onSelect?.(item);
    }
  };


  const displayValue = (item) => {
  if (!item) return query; // if no item, show whatever is in query

  if (size === "summary") {
    return `${item.city}, ${item.code}`;
  }

  if (hideSelectedInInput) return query || "";

  // Only show selected city if query is empty
  return query || item.city || "";
};



  // Adjust font sizes for summary vs default
  const inputClass =
    size === "summary"
      ? "text-lg font-medium"
      : "text-[28px] font-semibold";

  const dropdownCityClass = size === "summary" ? "text-sm font-medium" : "text-base font-medium";
  const dropdownNameClass = size === "summary" ? "text-xs text-gray-500" : "text-xs text-gray-500";

  return (
    <div className="w-full">
      <Combobox value={selectedItem} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            className={`w-full bg-transparent border-none rounded-md text-indigo-950 placeholder-gray-500 focus:outline-none ${inputClass} max-w-[200px]`}
            displayValue={displayValue}
            autoComplete="off"
            onChange={handleInputChange}
            placeholder={placeholder || `Search ${type}s...`}
          />

          {(query.length >= 2 || items.length > 0) && (
            <Combobox.Options className="absolute mt-1 max-h-60 w-lg overflow-auto rounded-md bg-white border border-gray-200 shadow-lg z-50">
              {isLoading ? (
                <div className="px-4 py-2 text-gray-500">Loading...</div>
              ) : items.length === 0 && query.length >= 2 ? (
                <div className="px-4 py-2 text-gray-500">No {type}s found.</div>
              ) : (
                items.map((item, idx) => (
                  <Combobox.Option
                    key={`${item.code}-${idx}`}
                    value={item}
                    className={({ active }) =>
                      `cursor-pointer select-none px-3 py-2 ${
                        active ? "bg-gray-50 text-indigo-950" : "text-gray-900"
                      }`
                    }
                  >
                    <div className="flex flex-col">
                      <span className={dropdownCityClass}>
                        {item.city} ({item.code})
                      </span>
                      <span className={dropdownNameClass}>{item.name}</span>
                    </div>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
};

export default AutocompleteSelect;
