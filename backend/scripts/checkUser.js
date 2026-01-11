import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const email = process.argv[2] || 'test@example.com';

const run = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    if (!user) {
      console.log(`No user found for email: ${email}`);
    } else {
      console.log('User found:');
      console.log(JSON.stringify(user, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
