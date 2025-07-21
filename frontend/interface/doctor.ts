export interface User {
  _id: string;
  firstName?: string;
  lastName: string;
  email: string;
  gender: string;
  phoneNumber?: string;
}

export interface Doctor {
  _id: string;
  user: User;
  speciality?: string;
  city?: string;
  adress?: string;
  location_maps?: string;
  credential_img?: string;
  verified: boolean;
  description?: string;
  keywords?: string[];
}

export interface SampleDoctor{
    id: string; // Add the id field
    name: string;
    specialty: string;
    location: string;
    description: string;
    keywords: string[];
    onAppointmentClick: () => void;
}