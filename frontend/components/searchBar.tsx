"use client";
import React, { FormEvent, useEffect, useState } from "react";
import { Search, MapPin, Stethoscope, User } from "lucide-react";
import { fetchCities, fetchSpecialities } from "@/api/doctor";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [specialties, setSpecialities] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const setLocationAndSpecialty = async () => {
      const fetchedSpecialties = await fetchSpecialities();
      const fetchedLocations = await fetchCities();

      setSpecialities(fetchedSpecialties);
      setLocations(fetchedLocations);

      setSpecialty(fetchedSpecialties[0] ?? "");
      setLocation(fetchedLocations[0] ?? "");
    };

    setLocationAndSpecialty();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (location.trim()) params.set("city", location.trim());
    if (specialty.trim()) params.set("speciality", specialty.trim());

    const queryString = params.toString();

    // always log it for debugging

    router.push(`/doctorsList?${queryString}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Main Search Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0e77d6] to-[#1e88e5] px-6 py-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-white" />
            <h2 className="text-white font-semibold text-lg">
              Find Healthcare Professionals
            </h2>
          </div>
        </div>

        {/* Search Form */}
        <div className="p-6">
          {/* Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Specialty */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Specialty
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e77d6] focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none bg-white cursor-pointer text-gray-700"
                >
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e77d6] focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none bg-white cursor-pointer text-gray-700"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <button
              className="bg-gradient-to-r from-[#0e77d6] to-[#1e88e5] hover:from-[#0c68b9] hover:to-[#1976d2] text-white font-semibold py-4 px-12 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 text-lg"
              onClick={handleSearchSubmit}
            >
              <Search className="w-5 h-5" />
              <span>Find Doctors</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
