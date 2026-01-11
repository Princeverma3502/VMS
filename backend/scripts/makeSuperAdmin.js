import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const makeSuperAdmin = async () => {
  try {
    const email = "230108048@hbtu.ac.in"; // <--- PUT YOUR EMAIL HERE

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found!');
      process.exit();
    }

    user.isSuperAdmin = true;
    user.role = 'Secretary'; // Ensure they have base access
    user.isApproved = true;
    await user.save();

    console.log(`SUCCESS: ${user.name} is now a Super Admin.`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

makeSuperAdmin();