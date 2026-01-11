import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const connection = mongoose.connection;
    
    // Drop the problematic index
    console.log('Attempting to drop rollNumber index...');
    try {
      await connection.db.collection('users').dropIndex('rollNumber_1');
      console.log('✅ Index dropped successfully');
    } catch (err) {
      console.log('Index not found or already dropped:', err.message);
    }
    
    // Close connection
    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixDatabase();
