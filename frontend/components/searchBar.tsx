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
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Main Search Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0e77d6] to-[#0e77d6] px-6 py-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Doctor/Practice Name */}

            {/* Specialty */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e77d6] focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none bg-white cursor-pointer"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e77d6] focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none bg-white cursor-pointer"
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
              className="bg-gradient-to-r from-[#0e77d6] to-[#0e77d6] hover:from-[#0c68b9] hover:to-[#0c68b9] text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              onClick={handleSearchSubmit}
            >
              <Search className="w-4 h-4" />
              <span>Search Healthcare Providers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search Tags */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Family Doctor",
            "Dentist",
            "Pediatrician",
            "Dermatologist",
            "Cardiologist",
          ].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 bg-[#e6f0fa] text-[#0e77d6] rounded-full text-sm hover:bg-[#d0e1f5] transition-colors duration-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
