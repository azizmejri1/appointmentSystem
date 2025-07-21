import { Doctor } from "@/interface/doctor";

export function mapDoctors(apiDoctors: Doctor[]) {
  return apiDoctors.map((doc) => {
    const name = `Dr ${doc.user.firstName ?? ''} ${doc.user.lastName}`.trim();
    const specialty = doc.speciality ?? 'Unknown specialty';
    const location = doc.city ?? 'Unknown location';
    const description =
      doc.description ??
      `Specialist in ${specialty} practicing in ${location}.`;
    const keywords = doc.keywords ?? [];

    return {
      id: doc._id, // Preserve the original doctor ID
      name,
      specialty,
      location,
      description,
      keywords,
      onAppointmentClick: () =>
        alert(`Booking appointment with ${name}`)
    };
  });
}
