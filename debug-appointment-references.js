const mongoose = require('mongoose');

async function debugAppointmentReferences() {
  try {
    await mongoose.connect('mongodb://localhost:27017/appointment-system');
    console.log('🔗 Connected to MongoDB');
    
    // Define schemas exactly as they are in the app
    const appointmentSchema = new mongoose.Schema({
      dateTime: Date,
      status: String,
      note: String,
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }
    });
    
    const doctorSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      specialization: String
    });
    
    const patientSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    });
    
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      role: String
    });
    
    const Appointment = mongoose.model('Appointment', appointmentSchema);
    const Doctor = mongoose.model('Doctor', doctorSchema);
    const Patient = mongoose.model('Patient', patientSchema);
    const User = mongoose.model('User', userSchema);
    
    // Find recent appointments
    const appointments = await Appointment.find()
      .sort({ dateTime: -1 })
      .limit(5);
    
    console.log('📋 Recent appointments (raw):');
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. ID: ${apt._id}`);
      console.log(`   DateTime: ${apt.dateTime}`);
      console.log(`   Doctor: ${apt.doctor} (type: ${typeof apt.doctor})`);
      console.log(`   Patient: ${apt.patient} (type: ${typeof apt.patient})`);
      console.log(`   Status: ${apt.status}`);
      console.log('---');
    });
    
    // Now try with populate
    const populatedAppointments = await Appointment.find()
      .populate('doctor')
      .populate('patient')
      .sort({ dateTime: -1 })
      .limit(5);
    
    console.log('\n📋 Recent appointments (populated):');
    populatedAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. ID: ${apt._id}`);
      console.log(`   DateTime: ${apt.dateTime}`);
      console.log(`   Doctor: ${apt.doctor ? 'Found' : 'NULL'} - ${apt.doctor}`);
      console.log(`   Patient: ${apt.patient ? 'Found' : 'NULL'} - ${apt.patient}`);
      console.log(`   Status: ${apt.status}`);
      console.log('---');
    });
    
    // Check if the referenced documents exist
    console.log('\n🔍 Checking referenced documents:');
    const allDoctors = await Doctor.find();
    console.log(`📊 Found ${allDoctors.length} doctors`);
    allDoctors.forEach((doc, index) => {
      console.log(`${index + 1}. Doctor ID: ${doc._id}, User: ${doc.user}`);
    });
    
    const allPatients = await Patient.find();
    console.log(`📊 Found ${allPatients.length} patients`);
    allPatients.forEach((doc, index) => {
      console.log(`${index + 1}. Patient ID: ${doc._id}, User: ${doc.user}`);
    });
    
    const allUsers = await User.find();
    console.log(`📊 Found ${allUsers.length} users`);
    allUsers.forEach((doc, index) => {
      console.log(`${index + 1}. User ID: ${doc._id}, Role: ${doc.role}, Name: ${doc.firstName} ${doc.lastName}`);
    });
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugAppointmentReferences();
