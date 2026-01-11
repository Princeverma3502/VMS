import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('📋 Checking for documents with null rollNumber...');
    const nullDocs = await usersCollection.find({ rollNumber: null }).count();
    console.log(`Found ${nullDocs} documents with rollNumber: null`);
    
    if (nullDocs > 0) {
      console.log('🗑️ Deleting documents with rollNumber: null...');
      const result = await usersCollection.deleteMany({ rollNumber: null });
      console.log(`✅ Deleted ${result.deletedCount} documents`);
    }
    
    console.log('📊 Checking for undefined rollNumber...');
    const undefinedDocs = await usersCollection.find({ rollNumber: { $exists: false } }).count();
    console.log(`Found ${undefinedDocs} documents without rollNumber field`);
    
    // List all indexes
    console.log('\n📑 Current indexes on users collection:');
    const indexes = await usersCollection.listIndexes().toArray();
    for (const idx of indexes) {
      console.log(`  - ${idx.name}:`, idx.key);
    }
    
    // Try to drop rollNumber index if it exists
    console.log('\n🔧 Attempting to clean up rollNumber index...');
    try {
      await usersCollection.dropIndex('rollNumber_1');
      console.log('✅ Dropped rollNumber_1 index');
    } catch (err) {
      console.log('⚠️ rollNumber index not found:', err.message);
    }
    
    console.log('\n✅ Database cleanup complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupDatabase();
