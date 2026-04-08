import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Reduced from 30d – shorter window limits breach impact
  });
};

export default generateToken;