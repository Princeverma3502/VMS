import User from '../models/User.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import { Parser } from 'json2csv';

// @desc    Get Volunteer Demographics (Branch, Year, Blood Group)
// @route   GET /analytics/demographics
// @access  Private/Secretary, Domain Head
export const getVolunteerDemographics = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    // Aggregate by Year
    const yearDistribution = await User.aggregate([
      { $match: { collegeId, role: 'Volunteer', isApproved: true } },
      { $group: { _id: "$year", count: { $sum: 1 } } }
    ]);

    // Aggregate by Branch
    const branchDistribution = await User.aggregate([
      { $match: { collegeId, role: 'Volunteer', isApproved: true } },
      { $group: { _id: "$branch", count: { $sum: 1 } } }
    ]);

    // Aggregate by Blood Group
    const bloodGroupDistribution = await User.aggregate([
      { $match: { collegeId, role: 'Volunteer', isApproved: true, bloodGroup: { $exists: true, $ne: null } } },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
    ]);

    // Total active volunteers
    const totalVolunteers = await User.countDocuments({ collegeId, role: 'Volunteer', isApproved: true });

    res.status(200).json({
      success: true,
      data: {
        totalVolunteers,
        yearDistribution,
        branchDistribution,
        bloodGroupDistribution
      }
    });
  } catch (error) {
    console.error("Analytics Demographics Error:", error);
    res.status(500).json({ message: "Failed to generate demographic analytics" });
  }
};

// @desc    Get Task Metric Overview (Completion Rates)
// @route   GET /analytics/tasks
// @access  Private/Secretary, Domain Head
export const getTaskMetrics = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    const taskStatusDistribution = await Task.aggregate([
      { $match: { collegeId } },
      { $group: { _id: "$status", count: { $sum: 1 }, totalXp: { $sum: "$xpReward" } } }
    ]);

    const totalTasks = await Task.countDocuments({ collegeId });
    const pendingTasks = await Task.countDocuments({ collegeId, status: { $ne: 'Completed' } });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        pendingTasks,
        taskStatusDistribution
      }
    });
  } catch (error) {
    console.error("Analytics Task Metrics Error:", error);
    res.status(500).json({ message: "Failed to generate task analytics" });
  }
};

// @desc    Get Event Engagement Over Time
// @route   GET /analytics/events
// @access  Private/Secretary, Domain Head
export const getEventAnalytics = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    // Get attendance stats for past events
    const eventEngagement = await Event.aggregate([
      { $match: { collegeId, status: 'Completed' } },
      {
        $project: {
          name: 1,
          date: 1,
          type: 1,
          attendeeCount: { $size: { $ifNull: ["$attendees", []] } },
          waitlistCount: { $size: { $ifNull: ["$waitlist", []] } }
        }
      },
      { $sort: { date: -1 } },
      { $limit: 10 } // Get last 10 completed events for chart visualization
    ]);

    const upcomingEventsCount = await Event.countDocuments({ collegeId, status: 'Upcoming' });

    res.status(200).json({
      success: true,
      data: {
        eventEngagement,
        upcomingEventsCount
      }
    });
  } catch (error) {
    console.error("Analytics Event Error:", error);
    res.status(500).json({ message: "Failed to generate event analytics" });
  }
};

// @desc    Export Volunteer Roster and Metrics to CSV
// @route   GET /analytics/export/volunteers
// @access  Private/Secretary
export const exportVolunteerCSV = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    // Fetch volunteers with relevant data
    const volunteers = await User.find({ collegeId, role: 'Volunteer', isApproved: true })
      .select('name email branch year whatsappNumber gamification')
      .lean();

    if (!volunteers.length) {
      return res.status(404).json({ message: "No active volunteers found for export" });
    }

    // Flatten nested gamification data for CSV columns
    const formattedData = volunteers.map(v => ({
      Name: v.name,
      Email: v.email,
      Branch: v.branch || 'N/A',
      Year: v.year || 'N/A',
      WhatsApp: v.whatsappNumber || 'N/A',
      LifetimeXP: v.gamification?.lifetimeXP || 0,
      Level: v.gamification?.level || 1,
      StreakDays: v.gamification?.streak || 0,
      TotalHoursLogged: v.gamification?.totalHours || 0,
      TasksCompleted: v.gamification?.tasksCompleted || 0
    }));

    // Convert JSON to CSV using json2csv Parser
    const parser = new Parser();
    const csv = parser.parse(formattedData);

    // Set Response Headers to force download as CSV
    res.header('Content-Type', 'text/csv');
    res.attachment('VMS_Volunteer_Report.csv');
    return res.status(200).send(csv);

  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({ message: "Failed to generate CSV export" });
  }
};
