import React, { useState } from "react";

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  currentLocation?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  currentLocation,
}) => {
  const [searchAddress, setSearchAddress] = useState(currentLocation || "");
  const [isSearching, setIsSearching] = useState(false);

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return;

    setIsSearching(true);
    try {
      // Using a simple geocoding approach
      // In a real application, you'd use Google Maps Geocoding API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchAddress
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        onLocationSelect({
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon),
          address: location.display_name,
        });
      }
    } catch (error) {
      console.error("Error searching for address:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const generateGoogleMapsLink = () => {
    if (!searchAddress.trim()) return "";
    const encodedAddress = encodeURIComponent(searchAddress);
    return `https://www.google.com/maps/search/${encodedAddress}`;
  };

  const generateEmbedLink = () => {
    if (!searchAddress.trim()) return "";
    const encodedAddress = encodeURIComponent(searchAddress);
    return `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodedAddress}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for your clinic location
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your clinic address"
          />
          <button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearching || !searchAddress.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {searchAddress && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps Link (for patients)
            </label>
            <input
              type="url"
              value={generateGoogleMapsLink()}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              This link will help patients find your clinic
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Preview
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-sm">Map preview will appear here</p>
                <p className="text-xs">
                  To enable interactive maps, integrate with Google Maps API
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-blue-800">
          To get the exact Google Maps link for your clinic:
        </p>
        <ol className="text-sm text-blue-800 mt-2 ml-4 list-decimal space-y-1">
          <li>Go to Google Maps</li>
          <li>Search for your clinic address</li>
          <li>Click "Share" and copy the link</li>
          <li>Paste it in the "Google Maps Link" field above</li>
        </ol>
      </div>
    </div>
  );
};

export default LocationPicker;
