const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import actual models
const User = require('./models/User');
const Doctor = require('./models/Doctor');

async function seedDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/symptom-triage');
    console.log('MongoDB connected');

    // Check existing doctors
    const existingDoctors = await User.find({ role: 'doctor' });
    console.log(`Existing doctors: ${existingDoctors.length}`);

    if (existingDoctors.length === 0) {
      // Create comprehensive sample doctors with different specializations
      const doctors = [
        {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh@hospital.com',
          password: 'password123',
          phone: '9876543210',
          role: 'doctor',
          specialization: 'General',
          experience: 12,
          consultationFee: 500,
          rating: 4.8
        },
        {
          name: 'Dr. Priya Singh',
          email: 'priya@hospital.com',
          password: 'password123',
          phone: '9876543211',
          role: 'doctor',
          specialization: 'Cardiology',
          experience: 10,
          consultationFee: 800,
          rating: 4.9
        },
        {
          name: 'Dr. Amit Patel',
          email: 'amit@hospital.com',
          password: 'password123',
          phone: '9876543212',
          role: 'doctor',
          specialization: 'Neurology',
          experience: 8,
          consultationFee: 700,
          rating: 4.7
        },
        {
          name: 'Dr. Sarah Williams',
          email: 'sarah@hospital.com',
          password: 'password123',
          phone: '9876543213',
          role: 'doctor',
          specialization: 'Orthopedics',
          experience: 9,
          consultationFee: 600,
          rating: 4.6
        },
        {
          name: 'Dr. Mohammed Hassan',
          email: 'hassan@hospital.com',
          password: 'password123',
          phone: '9876543214',
          role: 'doctor',
          specialization: 'Dermatology',
          experience: 7,
          consultationFee: 550,
          rating: 4.7
        },
        {
          name: 'Dr. Emily Chen',
          email: 'emily@hospital.com',
          password: 'password123',
          phone: '9876543215',
          role: 'doctor',
          specialization: 'Pediatrics',
          experience: 6,
          consultationFee: 500,
          rating: 4.8
        },
        {
          name: 'Dr. James Mitchell',
          email: 'james@hospital.com',
          password: 'password123',
          phone: '9876543216',
          role: 'doctor',
          specialization: 'Psychiatry',
          experience: 11,
          consultationFee: 750,
          rating: 4.9
        },
        {
          name: 'Dr. Vikram Reddy',
          email: 'vikram@hospital.com',
          password: 'password123',
          phone: '9876543217',
          role: 'doctor',
          specialization: 'Emergency',
          experience: 15,
          consultationFee: 1000,
          rating: 5.0
        }
      ];

      for (let doc of doctors) {
        const salt = await bcrypt.genSalt(10);
        doc.password = await bcrypt.hash(doc.password, salt);
        const user = await User.create(doc);
        
        // Create doctor profile
        await Doctor.create({
          userId: user._id,
          name: doc.name,
          license: `LIC${Math.random().toString(36).substring(2, 10).toUpperCase()}${Date.now()}`,
          specialization: doc.specialization,
          bio: `Dr. ${doc.name.split(' ')[1]} is a highly experienced ${doc.specialization} specialist with expertise in patient care.`,
          experience: doc.experience,
          qualifications: ['MD', 'MBBS', 'Board Certified'],
          hospitalAffiliation: 'City Medical Center',
          consultationFee: doc.consultationFee,
          rating: doc.rating,
          totalConsultations: Math.floor(Math.random() * 100) + 10,
          availability: {
            monday: { start: '09:00', end: '18:00' },
            tuesday: { start: '09:00', end: '18:00' },
            wednesday: { start: '09:00', end: '18:00' },
            thursday: { start: '09:00', end: '18:00' },
            friday: { start: '09:00', end: '18:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: { start: '', end: '' }
          }
        });

        console.log(`✅ Created doctor: ${doc.name} (${doc.specialization})`);
      }

      console.log('✅ Sample doctors created successfully!');
    } else {
      console.log('Doctors already exist in database');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedDoctors();
