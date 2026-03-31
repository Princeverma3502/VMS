import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import College from '../models/College.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    let college = await College.findOne({ slug: 'hbtu' });
    if (!college) {
      college = await College.create({ name: 'Harcourt Butler Technical University', slug: 'hbtu' });
    }

    const password = await bcrypt.hash('Password123!', 10);

    // Create Secretary
    await User.findOneAndUpdate(
      { email: 'test_sec@hbtu.ac.in' },
      {
        name: 'Test Secretary',
        password,
        role: 'Secretary',
        collegeId: college._id,
        isApproved: true,
        whatsappNumber: '9190000000',
        branch: 'CSE',
        year: '4th'
      },
      { upsert: true }
    );

    // Create Volunteer
    await User.findOneAndUpdate(
      { email: 'test_vol@hbtu.ac.in' },
      {
        name: 'Test Volunteer',
        password,
        role: 'Volunteer',
        collegeId: college._id,
        isApproved: true,
        whatsappNumber: '9180000000',
        branch: 'IT',
        year: '1st'
      },
      { upsert: true }
    );

    // Create Domain Head
    await User.findOneAndUpdate(
      { email: 'test_dh@hbtu.ac.in' },
      {
        name: 'Test Domain Head',
        password,
        role: 'Domain Head',
        collegeId: college._id,
        isApproved: true,
        whatsappNumber: '9170000000',
        branch: 'CH',
        year: '3rd'
      },
      { upsert: true }
    );

    // Create Associate Head
    await User.findOneAndUpdate(
      { email: 'test_ah@hbtu.ac.in' },
      {
        name: 'Test Associate Head',
        password,
        role: 'Associate Head',
        collegeId: college._id,
        isApproved: true,
        whatsappNumber: '9160000000',
        branch: 'ME',
        year: '2nd'
      },
      { upsert: true }
    );

    console.log('Test users seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
