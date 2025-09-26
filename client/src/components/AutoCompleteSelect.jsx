import { useEffect, useState, useCallback } from "react";
import { Combobox } from "@headlessui/react";
import axiosClient from "../../axios-client";
import { debounce } from "lodash";

const AutocompleteSelect = ({
  type,
  onSelect,
  placeholder,
  defaultItem = null,
  value, // Current selected value
}) => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const endpoint = type === "airport" ? "/airports" : "/airlines";

  // Initialize component with default value
  useEffect(() => {
    if (value?.code && !selectedItem) {
      // If we have a code but no full item data, fetch it or create a basic item
      if (value.city && value.name) {
        setSelectedItem(value);
      } else {
        // Create a temporary item with just the code for display
        setSelectedItem({
          code: value.code,
          city: value.city || value.code,
          name: value.name || value.code,
          country: value.country || ""
        });
      }
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
          { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
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
    if (!item) return "";
    return `${item.city || item.code} (${item.code})`;
  };

  return (
    <div className="w-full">
      <Combobox value={selectedItem} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            displayValue={displayValue}
            autoComplete="off"
            onChange={handleInputChange}
            placeholder={placeholder || `Search ${type}s...`}
          />
          
          {(query.length >= 2 || items.length > 0) && (
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-200 shadow-lg z-10">
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
                    {`${item.name} (${item.code}) - ${item.city}, ${item.country}`}
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