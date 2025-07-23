import { useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Doctor {
  _id: string;
  user: User;
  specialization: string;
  experienceYears: number;
  // Add other doctor fields as needed
}

interface Patient {
  _id: string;
  user: User;
  // Add other patient fields as needed
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Doctor | Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'doctor' | 'patient' | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check localStorage for user data (existing auth system)
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const profileId = localStorage.getItem('profileId');
        const userId = localStorage.getItem('userId');
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');
        
        // Since we're in the doctor dashboard, we can assume userType is 'doctor'
        // You could also check the current route to determine this
        const storedUserType = 'doctor';

        if (!profileId || !userId) {
          setLoading(false);
          return;
        }

        // Create user object from localStorage data
        const userData: User = {
          _id: userId, // Use userId as the user ID for notifications
          email: '', // Email not stored in localStorage
          firstName: firstName || '',
          lastName: lastName || '',
          role: storedUserType,
        };

        console.log('🔍 useCurrentUser - localStorage data:', {
          userId,
          profileId,
          firstName,
          lastName,
          userType: storedUserType
        });
        console.log('👤 useCurrentUser - Setting user._id to:', userId);

        setUser(userData);
        setUserType(storedUserType as 'doctor' | 'patient');

        // Try to fetch full profile data from API
        const baseUrl = 'http://localhost:8080';
        const endpoint = storedUserType === 'doctor' ? '/doctors' : '/patients';
        
        try {
          const response = await fetch(`${baseUrl}${endpoint}/${profileId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const profileData = await response.json();
            setProfile(profileData);
            // Update user data with API response if available
            if (profileData.user) {
              setUser(profileData.user);
            }
          }
        } catch (apiError) {
          // Continue with localStorage data even if API fails
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return {
    user,
    profile,
    userType,
    loading,
    isAuthenticated: !!user,
  };
};
