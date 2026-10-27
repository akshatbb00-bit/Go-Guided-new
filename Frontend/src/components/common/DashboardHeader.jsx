import { ArrowLeft, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import useSafeNavigate from "../../utils/useSafeNavigate";
import FilterDropdown from "./FilterDropdown";
import { useState } from "react";
import { FaSortAmountUp, FaSortAmountDown } from "react-icons/fa";

function DashboardHeader({
  title,
  totalCount,
  filterState,
  setFilterState,
  filterOptions,
}) {
  const navigate = useSafeNavigate();
  const [query, setQuery] = useState(filterState.searchQuery || "");

  return (
    <div className="bg-white border border-green-200 p-3 rounded-md shadow-sm mb-2 w-full flex flex-col lg:flex-row justify-between gap-3">
      {/* Title and Back */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-md transition cursor-pointer h-9 w-9 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h3 className="text-base sm:text-lg font-semibold text-green-900">
          {totalCount > 0 ? `${title}: ${totalCount}` : "No Results Found"}
        </h3>
      </div>

      {/* Controls container */}
      <div className="flex flex-col sm:flex-row lg:items-center w-full gap-2">
        {/* Search input with button */}
        <div className="flex flex-1">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}`}
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              if (value === "") {
                setFilterState((prev) => ({
                  ...prev,
                  searchQuery: "",
                }));
              }
            }}
            className="bg-green-50 border border-green-200 px-3 py-1.5 rounded-l-md text-sm w-full focus:border-green-500 text-green-800 outline-none h-9"
          />
          <button
            onClick={() =>
              setFilterState((prev) => ({
                ...prev,
                searchQuery: query,
              }))
            }
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-3 py-1.5 rounded-r-md shadow-md flex items-center h-9"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Sort & Filter buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              setFilterState((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
              }));
            }}
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-3 py-1.5 rounded-md shadow-md h-9"
          >
            {filterState.sortOrder === "asc" ? (
              <FaSortAmountUp className="w-4 h-4 text-white" />
            ) : (
              <FaSortAmountDown className="w-4 h-4 text-white" />
            )}
          </button>

          {filterOptions && (
            <div className="w-full sm:w-auto">
              <FilterDropdown
                options={filterOptions}
                selectedFilters={filterState.selectedFilters}
                setSelectedFilters={setFilterState}
                style={{ width: "w-48", maxHeight: "max-h-64" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
