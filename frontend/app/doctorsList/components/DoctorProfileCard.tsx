import React from "react";
import { MapPin, Calendar } from "lucide-react";

const DoctorProfileCard = ({
  name = "Dr Doctor's Name",
  specialty = "Specialty",
  location = "Location",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eu molestie orci.",
  keywords = [
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
  ],
  profileImage = null,
  onAppointmentClick = () => console.log("Appointment clicked"),
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt={`${name} profile`}
              className="w-32 h-32 rounded-2xl object-cover shadow-inner"
            />
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-inner">
              <div className="w-16 h-16 bg-gray-400 rounded-full mb-2"></div>
              <div className="w-20 h-10 bg-gray-400 rounded-t-full -mt-6"></div>
            </div>
          )}
        </div>

        {/* Doctor Information */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{name}</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="text-sm font-medium">{specialty}</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {description}
          </p>

          {/* Keywords */}
          <div className="flex flex-wrap gap-2 mb-6">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                {keyword}
              </span>
            ))}
          </div>

          {/* Appointment Button */}
          <div className="flex justify-end">
            <button
              onClick={onAppointmentClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Calendar className="w-4 h-4" />
              Take an appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileCard;
