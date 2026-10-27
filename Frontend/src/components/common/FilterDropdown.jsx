import { useState, useRef, useEffect } from "react";
import { FaFilter } from "react-icons/fa";

function FilterDropdown({
  options,
  selectedFilters,
  setSelectedFilters,
  style,
}) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openGroup, setOpenGroup] = useState(
    options.length > 0 ? options[0].label : null
  );
  const [tempDateFilters, setTempDateFilters] = useState({}); // Temporary local state
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
        setOpenGroup(options.length > 0 ? options[0].label : null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown, options]);

  // Handle regular filter selection
  const handleSelect = (category, value) => {
    setSelectedFilters((prevFilters) => {
      const selectedFilters = { ...prevFilters.selectedFilters };

      if (selectedFilters[category] === value) {
        delete selectedFilters[category];
      } else {
        selectedFilters[category] = value;
      }

      return { ...prevFilters, selectedFilters };
    });
  };

  // Update temp date filters locally
  const handleTempDateChange = (key, value) => {
    setTempDateFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Commit both dates to state and add "Date Interval" entry to selectedFilters
  const handleCommitDates = (category) => {
    const { startDate, endDate } = tempDateFilters;

    if (startDate && endDate) {
      setSelectedFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters.selectedFilters };

        // Add "Date Interval" entry
        updatedFilters[category] = { startDate, endDate };

        return {
          ...prevFilters,
          selectedFilters: updatedFilters,
        };
      });
    } else {
      alert("Please enter both Start Date and End Date.");
    }
  };

  // Clear date filter
  const handleClearDates = (category) => {
    // Clear temp date filters
    setTempDateFilters((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));

    // Clear selectedFilters entry for Date Interval
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters.selectedFilters };
      delete updatedFilters[category]; // Remove the entry
      return {
        ...prevFilters,
        selectedFilters: updatedFilters,
      };
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setOpenDropdown(!openDropdown)}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md shadow-md flex items-center justify-center space-x-2 cursor-pointer transition text-sm focus:outline-none focus:ring-0 focus:border-green-600 h-9"
      >
        <FaFilter className="w-4 h-4" />
        <span className="text-sm">Filter</span>
      </button>

      {/* Dropdown Menu */}
      {openDropdown && (
        <div
          className={`absolute right-0 mt-2 flex flex-col gap-1 bg-green-100 border border-green-300 shadow-lg rounded-md z-50 overflow-y-auto ${
            style?.width || "w-48"
          }`}
        >
          {options.map((group) => (
            <div key={group.label}>
              {/* Clickable Label */}
              <div
                className="px-4 py-2 text-green-800 font-semibold bg-green-200 cursor-pointer hover:bg-green-300"
                onClick={() =>
                  setOpenGroup(openGroup === group.label ? null : group.label)
                }
              >
                {group.label}
              </div>

              {/* Options List */}
              {openGroup === group.label && (
                <ul className="flex flex-col bg-green-100 border-t border-green-300">
                  {group.children.map((option, index) => {
                    if (option.type === "date") {
                      return (
                        <li
                          key={index}
                          className="px-4 py-2 flex flex-col relative"
                        >
                          <label className="text-green-800 font-medium">
                            {option.label}
                          </label>
                          <input
                            type="date"
                            value={tempDateFilters[option.value] || ""}
                            onChange={(e) =>
                              handleTempDateChange(option.value, e.target.value)
                            }
                            className="border border-green-300 rounded px-2 py-1"
                          />
                        </li>
                      );
                    } else {
                      return (
                        <li
                          key={option.value}
                          className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-green-200 transition ${
                            selectedFilters[group.label] === option.value
                              ? "font-bold text-green-900 bg-green-300"
                              : ""
                          }`}
                          onClick={() =>
                            handleSelect(group.label, option.value)
                          }
                        >
                          {option.label}
                          {selectedFilters[group.label] === option.value && (
                            <span>✅</span>
                          )}
                        </li>
                      );
                    }
                  })}
                  {/* Commit Dates Button */}
                  {group.label === "Date Interval" && (
                    <div className="flex items-center justify-between mt-2 px-2 p-1">
                      <button
                        onClick={() => handleClearDates(group.label)}
                        className={`cursor-pointer  text-white px-2 py-1 rounded-md ${
                          tempDateFilters.startDate || tempDateFilters.endDate
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        ❌
                      </button>
                      {tempDateFilters.startDate && tempDateFilters.endDate && (
                        <button
                          onClick={() => handleCommitDates(group.label)}
                          className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                        >
                          Apply Dates
                        </button>
                      )}
                    </div>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
