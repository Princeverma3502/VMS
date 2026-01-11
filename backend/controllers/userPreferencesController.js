import asyncHandler from 'express-async-handler';
import UserPreferences from '../models/UserPreferences.js';

// @desc    Get user preferences
// @route   GET /api/preferences
// @access  Private
export const getPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let preferences = await UserPreferences.findOne({ userId });

  if (!preferences) {
    // Create default preferences
    preferences = await UserPreferences.create({
      userId,
      theme: 'light',
      language: 'en',
      notifications: {
        activityFeed: true,
        polls: true,
        announcements: true,
        taskReminders: true,
        achievements: true,
        email: false,
        push: true,
      },
      privacy: {
        showProfile: true,
        showActivity: true,
        showStats: true,
        allowMessages: true,
      },
      customColors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#FBBF24',
      },
      layout: {
        sidebarCollapsed: false,
        compactMode: false,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: preferences,
  });
});

// @desc    Update user theme
// @route   PUT /api/preferences/theme
// @access  Private
export const updateTheme = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { theme } = req.body;

  if (!['light', 'dark', 'nss-blue'].includes(theme)) {
    return res.status(400).json({ message: 'Invalid theme' });
  }

  let preferences = await UserPreferences.findOne({ userId });

  if (!preferences) {
    preferences = await UserPreferences.create({ userId, theme });
  } else {
    preferences.theme = theme;
    await preferences.save();
  }

  res.status(200).json({
    success: true,
    message: 'Theme updated successfully',
    data: { theme: preferences.theme },
  });
});

// @desc    Update notification preferences
// @route   PUT /api/preferences/notifications
// @access  Private
export const updateNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { notifications } = req.body;

  let preferences = await UserPreferences.findOne({ userId });

  if (!preferences) {
    preferences = await UserPreferences.create({ userId, notifications });
  } else {
    preferences.notifications = { ...preferences.notifications, ...notifications };
    await preferences.save();
  }

  res.status(200).json({
    success: true,
    message: 'Notification preferences updated',
    data: preferences.notifications,
  });
});

// @desc    Update privacy preferences
// @route   PUT /api/preferences/privacy
// @access  Private
export const updatePrivacy = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { privacy } = req.body;

  let preferences = await UserPreferences.findOne({ userId });

  if (!preferences) {
    preferences = await UserPreferences.create({ userId, privacy });
  } else {
    preferences.privacy = { ...preferences.privacy, ...privacy };
    await preferences.save();
  }

  res.status(200).json({
    success: true,
    message: 'Privacy preferences updated',
    data: preferences.privacy,
  });
});

// @desc    Update custom colors
// @route   PUT /api/preferences/colors
// @access  Private
export const updateColors = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { customColors } = req.body;

  let preferences = await UserPreferences.findOne({ userId });

  if (!preferences) {
    preferences = await UserPreferences.create({ userId, customColors });
  } else {
    preferences.customColors = { ...preferences.customColors, ...customColors };
    await preferences.save();
  }

  res.status(200).json({
    success: true,
    message: 'Colors updated successfully',
    data: preferences.customColors,
  });
});

// @desc    Update language preference
// @route   PUT /api/preferences/language
// @access  Private
export const updateLanguage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { language } = req.body;

  if (!['en', 'hi'].includes(language)) {
    return res.status(400).json({ message: 'Invalid language' });
  }

  let preferences = await UserPreferences.findOne({ userId });

  if (!preferences) {
    preferences = await UserPreferences.create({ userId, language });
  } else {
    preferences.language = language;
    await preferences.save();
  }

  res.status(200).json({
    success: true,
    message: 'Language updated successfully',
    data: { language: preferences.language },
  });
});

// @desc    Update layout preferences
// @route   PUT /api/preferences/layout
// @access  Private
export const updateLayout = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { layout } = req.body;

  let preferences = await UserPreferences.findOne({ userId });

  if (!preferences) {
    preferences = await UserPreferences.create({ userId, layout });
  } else {
    preferences.layout = { ...preferences.layout, ...layout };
    await preferences.save();
  }

  res.status(200).json({
    success: true,
    message: 'Layout preferences updated',
    data: preferences.layout,
  });
});

// @desc    Reset preferences to default
// @route   DELETE /api/preferences/reset
// @access  Private
export const resetPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await UserPreferences.findOneAndDelete({ userId });

  const defaultPreferences = {
    theme: 'light',
    language: 'en',
    notifications: {
      activityFeed: true,
      polls: true,
      announcements: true,
      taskReminders: true,
      achievements: true,
      email: false,
      push: true,
    },
    privacy: {
      showProfile: true,
      showActivity: true,
      showStats: true,
      allowMessages: true,
    },
    customColors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#FBBF24',
    },
    layout: {
      sidebarCollapsed: false,
      compactMode: false,
    },
  };

  res.status(200).json({
    success: true,
    message: 'Preferences reset to default',
    data: defaultPreferences,
  });
});
