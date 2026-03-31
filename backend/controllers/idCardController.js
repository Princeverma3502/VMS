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
  const settings = await CollegeSettings.findOne({ collegeId: req.user.collegeId });
  if (settings && settings.idCardOptions) {
    res.json({
      ...settings.idCardOptions,
      collegeSubheading: settings.collegeSubheading || 'Harcourt Butler Technical University'
    });
  } else {
    res.json({
        templateId: 'executive-pro',
        orgName: 'NATIONAL SERVICE SCHEME',
        subHeader: 'Your College Name',
        collegeSubheading: 'Harcourt Butler Technical University',
        roleColors: { 'Volunteer': '#1d4ed8' }
    });
  }
});

// @desc    Update ID Card Settings
// @route   PUT /settings/id-card
// export const updateIDCardSettings = asyncHandler(async (req, res) => {
//   const { 
//     templateId, orgName, subHeader, collegeLogo, councilLogo, 
//     signatureUrl, signatureName, signatureRole, roleColors, visibleFields 
//   } = req.body;

//   let settings = await CollegeSettings.findOne({ collegeId: req.user.collegeId });

//   if (!settings) {
//     settings = new CollegeSettings({ collegeId: req.user.collegeId });
//   }

//   settings.idCardOptions = {
//     templateId, orgName, subHeader, collegeLogo, councilLogo,
//     signatureUrl, signatureName, signatureRole, roleColors, visibleFields
//   };

//   await settings.save();
//   res.json({ message: "ID Card Configuration Saved", settings: settings.idCardOptions });
// });

export const updateIDCardSettings = asyncHandler(async (req, res) => {
  const { 
    templateId, orgName, subHeader, collegeLogo, councilLogo, 
    signatureUrl, signatureName, signatureRole, roleColors, visibleFields, collegeSubheading 
  } = req.body;

  let settings = await CollegeSettings.findOne({ collegeId: req.user.collegeId });

  if (!settings) {
    settings = new CollegeSettings({ collegeId: req.user.collegeId });
  }

  settings.idCardOptions = {
    templateId, orgName, subHeader, collegeLogo, councilLogo,
    signatureUrl, signatureName, signatureRole, roleColors, visibleFields
  };
  settings.collegeSubheading = collegeSubheading || 'Harcourt Butler Technical University';

  await settings.save();
  res.json({ message: "ID Card Configuration Saved", settings: settings.idCardOptions });
});
