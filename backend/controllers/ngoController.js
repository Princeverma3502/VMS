import fs from 'fs';
import NGO from '../models/NGO.js';

// @desc    Register a new NGO
export const registerNGO = async (req, res) => {
  const { name, description } = req.body;
  
  // File handling
  const logoUrl = req.file ? req.file.path : null;

  try {
    const ngo = await NGO.create({
      name,
      description,
      logoUrl,
      registeredBy: req.user._id
    });

    res.status(201).json(ngo);
  } catch (error) {
    // --- CLEANUP FIX: Delete uploaded file if DB fails ---
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete orphan file:", err);
      });
    }
    
    res.status(400);
    throw new Error('Invalid NGO data');
  }
};

export const getNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({});
    res.status(200).json(ngos || []);
  } catch (error) {
    console.error('Get NGOs Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch NGOs' });
  }
};