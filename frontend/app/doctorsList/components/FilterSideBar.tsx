import { fetchCities, fetchSpecialities } from "@/api/doctor";
import { Clock, Filter, MapPin, Search, Stethoscope } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Filters {
  search: string;
  specialty: string;
  location: string;
  availability: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
}

const FilterSidebar = ({ filters, onFilterChange }: FilterSidebarProps) => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const setLocationAndSpecialty = async () => {
      const fetchedSpecialties = await fetchSpecialities();
      const fetchedLocations = await fetchCities();

      setSpecialties(fetchedSpecialties);
      setLocations(fetchedLocations);

      // Optional: if you want to set default selected values
      if (!filters.specialty) {
        onFilterChange({ specialty: fetchedSpecialties[0] ?? "" });
      }
      if (!filters.location) {
        onFilterChange({ location: fetchedLocations[0] ?? "" });
      }
    };

    setLocationAndSpecialty();
  }, []);

  return (
    <div className="w-80 bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-8">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Specialty Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Stethoscope className="w-4 h-4 inline mr-1" />
          Specialty
        </label>
        <select
          value={filters.specialty}
          onChange={(e) => onFilterChange({ specialty: e.target.value })}
          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Specialties</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Location
        </label>
        <select
          value={filters.location}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Availability Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Availability
        </label>
        <div className="space-y-2">
          {["Today", "This Week", "Next Week", "This Month"].map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.availability.includes(option)}
                onChange={(e) => {
                  const newAvailability = e.target.checked
                    ? [...filters.availability, option]
                    : filters.availability.filter((a) => a !== option);
                  onFilterChange({ availability: newAvailability });
                }}
                className="mr-2 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() =>
          onFilterChange({
            search: "",
            specialty: "",
            location: "",
            availability: [],
          })
        }
        className="w-full py-2 px-4 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
