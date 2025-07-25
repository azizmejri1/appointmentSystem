const axios = require('axios');

async function createTestAppointmentForReminder() {
  try {
    // Create an appointment scheduled for 3 minutes from now
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 3);
    
    console.log('🗓️ Creating test appointment for:', futureDate.toISOString());
    
    // We need to directly insert into MongoDB since we need to bypass normal appointment creation
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://localhost:27017/appointmentSystem');
    
    const appointmentData = {
      dateTime: futureDate,
      status: 'confirmed',
      note: 'Test appointment for reminder system',
      doctor: new mongoose.Types.ObjectId('68828a93221a77604241a91a'), // Mock doctor ID
      patient: new mongoose.Types.ObjectId('68828a93221a77604241a91b'), // Mock patient ID
    };
    
    const Appointment = mongoose.model('Appointment', new mongoose.Schema({
      dateTime: Date,
      status: String,
      note: String,
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }
    }));
    
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();
    
    console.log('✅ Test appointment created:', {
      id: savedAppointment._id,
      dateTime: savedAppointment.dateTime,
      doctor: savedAppointment.doctor,
      patient: savedAppointment.patient
    });
    
    // Now create test user documents to go with the appointment
    const User = mongoose.model('User', new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      role: String
    }));
    
    const Doctor = mongoose.model('Doctor', new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      specialization: String
    }));
    
    const Patient = mongoose.model('Patient', new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }));
    
    // Create test user for doctor
    const doctorUser = new User({
      _id: '68828a93221a77604241a919', // Use existing user ID
      firstName: 'Dr. Test',
      lastName: 'Doctor',
      email: 'doctor@test.com',
      role: 'doctor'
    });
    
    const doctorProfile = new Doctor({
      _id: '68828a93221a77604241a91a',
      user: '68828a93221a77604241a919',
      specialization: 'General Medicine'
    });
    
    // Create test user for patient
    const patientUser = new User({
      _id: '68828a93221a77604241a920',
      firstName: 'Test',
      lastName: 'Patient',
      email: 'patient@test.com',
      role: 'patient'
    });
    
    const patientProfile = new Patient({
      _id: '68828a93221a77604241a91b',
      user: '68828a93221a77604241a920'
    });
    
    try {
      console.log('💾 Saving doctor user...');
      await doctorUser.save();
      console.log('✅ Doctor user saved');
      
      console.log('💾 Saving doctor profile...');
      await doctorProfile.save();
      console.log('✅ Doctor profile saved');
      
      console.log('💾 Saving patient user...');
      await patientUser.save();
      console.log('✅ Patient user saved');
      
      console.log('💾 Saving patient profile...');
      await patientProfile.save();
      console.log('✅ Patient profile saved');
      
      console.log('✅ All test user profiles created successfully');
    } catch (error) {
      console.error('❌ Error creating user profiles:', error);
      throw error; // Don't ignore the error
    }
    
    // Update the appointment to reference the correct IDs
    await Appointment.findByIdAndUpdate(savedAppointment._id, {
      doctor: '68828a93221a77604241a91a',
      patient: '68828a93221a77604241a91b'
    });
    
    console.log('✅ Test appointment updated with proper references');
    
    await mongoose.disconnect();
    
    // Wait 1 minute then trigger the reminder check
    console.log('⏱️ Waiting 1 minute before triggering reminder check...');
    setTimeout(async () => {
      try {
        const response = await axios.post('http://localhost:8080/notifications/test-reminders');
        console.log('🔔 Reminder check triggered:', response.data);
      } catch (error) {
        console.error('❌ Error triggering reminder check:', error.response?.data || error.message);
      }
    }, 60000); // 1 minute delay
    
  } catch (error) {
    console.error('❌ Error creating test appointment:', error);
  }
}

createTestAppointmentForReminder();
