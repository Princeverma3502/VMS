import asyncHandler from 'express-async-handler';
import CollegeSettings from '../models/CollegeSettings.js';

// @desc    Get ID Card Settings
// @route   GET /settings/id-card
// export const getIDCardSettings = asyncHandler(async (req, res) => {
//   const settings = await CollegeSettings.findOne({ collegeId: req.user.collegeId });
//   if (settings && settings.idCardOptions) {
//     res.json(settings.idCardOptions);
//   } else {
//     res.json({
//         templateId: 'executive-pro',
//         orgName: 'NATIONAL SERVICE SCHEME',
//         subHeader: 'Your College Name',
//         collegeSubheading: 'Harcourt Butler Technical University',
//         roleColors: { 'Volunteer': '#1d4ed8' }
//     });
//   }
// });

export const getIDCardSettings = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.collegeId) {
    res.status(400);
    throw new Error('User college association not found');
  }

  const settings = await CollegeSettings.findOne({ collegeId: req.user.collegeId });
  if (settings && settings.idCardOptions) {
    res.json({
      ...settings.idCardOptions.toObject(),
      // Ensure collegeSubheading and studentSecretaries are properly returned
      collegeSubheading: settings.idCardOptions.collegeSubheading || 'Harcourt Butler Technical University',
      studentSecretaries: settings.idCardOptions.studentSecretaries || []
    });
  } else {
    res.json({
        templateId: 'executive-pro',
        orgName: 'NATIONAL SERVICE SCHEME',
        universityName: 'NATIONAL SERVICE SCHEME',
        subHeader: 'Your College Name',
        collegeSubheading: 'Harcourt Butler Technical University',
        roleColors: { 
          'Secretary': '#FFD700',
          'Domain Head': '#7c3aed',
          'Associate Head': '#10b981',
          'Volunteer': '#1d4ed8' 
        },
        studentSecretaries: []
    });
  }
});

// @desc    Update ID Card Settings
// @route   PUT /settings/id-card
export const updateIDCardSettings = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.collegeId) {
    res.status(400);
    throw new Error('User college association not found. Please contact admin.');
  }

  const { 
    templateId, orgName, universityName, subHeader, collegeLogo, councilLogo, 
    officerName, officerSig, validThru,
    secretaryName, secretarySig, secretary2Name, secretary2Sig, secretary3Name, secretary3Sig,
    roleColors, visibleFields, collegeSubheading, studentSecretaries 
  } = req.body;

  let settings = await CollegeSettings.findOne({ collegeId: req.user.collegeId });

  if (!settings) {
    settings = new CollegeSettings({ collegeId: req.user.collegeId });
  }

  settings.idCardOptions = {
    templateId, 
    orgName, 
    universityName,
    subHeader, 
    collegeLogo, 
    councilLogo,
    officerName,
    officerSig,
    validThru,
    secretaryName,
    secretarySig,
    secretary2Name,
    secretary2Sig,
    secretary3Name,
    secretary3Sig,
    collegeSubheading: collegeSubheading || 'Harcourt Butler Technical University',
    roleColors: roleColors || {},
    visibleFields: visibleFields || {
      photo: true,
      rollNumber: true,
      bloodGroup: true,
      year: true,
      branch: true,
      role: true
    },
    studentSecretaries: Array.isArray(studentSecretaries) ? studentSecretaries.slice(0,3) : []
  };

  await settings.save();
  res.json({ message: "ID Card Configuration Saved", settings: settings.idCardOptions });
});

