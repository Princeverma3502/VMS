import Domain from '../models/Domain.js';
import User from '../models/User.js';

// @desc    Create a new Domain
// @route   POST /api/domains
export const createDomain = async (req, res) => {
  try {
    const { name, headId } = req.body;

    if (!name || !headId) {
      res.status(400);
      throw new Error('Name and headId are required');
    }

    // 1. Check if domain exists
    const domainExists = await Domain.findOne({ name });
    if (domainExists) {
      res.status(400);
      throw new Error('Domain already exists');
    }

    // 2. Verify the Head User exists and has correct role
    const headUser = await User.findById(headId);
    if (!headUser || headUser.role !== 'Domain Head') {
      res.status(400);
      throw new Error('Invalid User ID or User is not a Domain Head');
    }

    // 3. Create Domain
    const domain = await Domain.create({
      name,
      head: headId
    });

    res.status(201).json(domain);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all Domains
// @route   GET /api/domains
export const getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.find({}).populate('head', 'name email');
    res.status(200).json(domains || []);
  } catch (error) {
    console.error('Get Domains Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch domains' });
  }
};