"use client";
import { useEffect, useState } from "react";
import FilterSidebar from "./components/FilterSideBar";
import DoctorProfileCard from "./components/DoctorProfileCard";
import { Stethoscope } from "lucide-react";
import { SampleDoctor } from "@/interface/doctor";
import { useSearchParams } from "next/navigation";
import { fetchAllDoctors, fetchDoctors } from "@/api/doctor";
import { mapDoctors } from "@/util/mapDoctor";
import Navbar from "@/components/navbar";
import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";
const App = () => {
  const searchParams = useSearchParams();

  const city = searchParams.get("city");
  const speciality = searchParams.get("speciality");

  const [filters, setFilters] = useState<{
    search: string;
    specialty: string;
    location: string;
    availability: any[];
  }>({
    search: "",
    specialty: speciality ?? "",
    location: city ?? "",
    availability: [],
  });

  const [sampleDoctors, setSampleDoctors] = useState<SampleDoctor[]>([]);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const getDoctors = async () => {
      const doctors = await fetchAllDoctors();
      setSampleDoctors(mapDoctors(doctors));
    };
    getDoctors();
  }, []);

  const handleFilterChange = (newFilters: {
    search?: string;
    specialty?: string;
    location?: string;
    availability?: any[];
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Filter doctors based on current filters
  const filteredDoctors = sampleDoctors.filter((doctor) => {
    const matchesSearch =
      filters.search === "" ||
      doctor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(filters.search.toLowerCase()) ||
      doctor.keywords.some((keyword) =>
        keyword.toLowerCase().includes(filters.search.toLowerCase())
      );

    const matchesSpecialty =
      filters.specialty === "" || doctor.specialty === filters.specialty;
    const matchesLocation =
      filters.location === "" || doctor.location === filters.location;

    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  return (
    <div>
      <Navbar setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      {showSignIn && (
        <SignIn setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      )}

      {showSignUp && (
        <SignUp setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      )}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Find Your Doctor
          </h1>

          <div className="flex gap-8">
            {/* Sidebar */}
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            {/* Main Content */}
            <div className="flex-1">
              {filteredDoctors.length > 0 ? (
                <div className="space-y-6">
                  <p className="text-gray-600 text-sm">
                    Showing {filteredDoctors.length} doctor
                    {filteredDoctors.length !== 1 ? "s" : ""}
                  </p>
                  {filteredDoctors.map((doctor, index) => (
                    <DoctorProfileCard key={index} {...doctor} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Stethoscope className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No doctors found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters to find more doctors.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
