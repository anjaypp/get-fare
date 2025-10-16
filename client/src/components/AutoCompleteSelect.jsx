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
      setQuery(""); // Clear search query after selection
      onSelect?.(item);
    }
  };

  const displayValue = (item) => {
    if (hideSelectedInInput) return query || ""; // keep showing user's query
    if (!item) return "";
    // show the code in the input; the dropdown shows code on first line and name on the second
    return item.city || "";
  };

  return (
    <div className="w-full">
      <Combobox value={selectedItem} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            className="w-full bg-transparent border-none rounded-md text-[28px] text-indigo-950 text-semibold placeholder-gray-500 focus:outline-none"
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
                      `cursor-pointer select-none px-4 py-2 ${
                        active ? "bg-blue-500 text-white" : "text-gray-900"
                      }`
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-base font-medium">{item.city} ({item.code})</span>
                      <span className="text-xs text-gray-500">{item.name}</span>
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
