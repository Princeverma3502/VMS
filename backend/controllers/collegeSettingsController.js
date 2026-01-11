import CollegeSettings from '../models/CollegeSettings.js';
import College from '../models/College.js';

const getSettingsByCollegeId = async (req, res) => {
  try {
    const { collegeId } = req.params;
    let settings = await CollegeSettings.findOne({ collegeId });
    if (!settings) {
      const college = await College.findById(collegeId).select('name logoUrl primaryColor secondaryColor');
      if (!college) return res.status(404).json({ message: 'College not found' });
      settings = {
        collegeId: college._id,
        logoUrl: college.logoUrl,
        primaryColor: college.primaryColor || '#1d4ed8',
        secondaryColor: college.secondaryColor || '#10b981',
        brandName: college.name,
      };
      return res.status(200).json(settings);
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const user = req.user;
    const { collegeId } = req.params;
    if (user.role !== 'Secretary' && user.role !== 'admin' && !user.isSuperAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (user.collegeId.toString() !== collegeId && !user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot modify settings for other colleges' });
    }

    const payload = req.body;
    let settings = await CollegeSettings.findOne({ collegeId });
    if (!settings) {
      settings = new CollegeSettings({ collegeId, ...payload, createdBy: user._id });
    } else {
      Object.assign(settings, payload);
      settings.lastUpdatedBy = user._id;
    }
    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

export default {
  getSettingsByCollegeId,
  updateSettings,
};
