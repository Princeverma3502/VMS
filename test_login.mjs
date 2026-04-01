import axios from 'axios';

async function check() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test_vol@hbtu.ac.in',
      password: 'Password123!'
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.log('ERROR STATUS:', err.response?.status);
    console.log('ERROR MESSAGE:', err.response?.data);
  }
}
check();
