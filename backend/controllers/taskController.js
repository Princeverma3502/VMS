import Task from '../models/Task.js';
import User from '../models/User.js';
import sendPushNotification from '../utils/pushNotification.js';

// @desc    Create a new task (Secretary/Admin Only)
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, deadline, xpReward, category } = req.body;
    const task = await Task.create({
      title,
      description,
      deadline,
      xpReward: xpReward || 20,
      category,
      status: 'Pending',
      createdBy: req.user._id,
      collegeId: req.user.collegeId
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const filter = req.user.collegeId ? { collegeId: req.user.collegeId } : {};
    const tasks = await Task.find(filter).populate('assignedUsers', 'name email').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// @desc    Delete a task (Secretary/Admin Only)
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Volunteer claims a task
// @route   PUT /api/tasks/claim/:id
export const claimTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check if user already claimed it
    if (task.assignedUsers.includes(req.user._id)) {
      return res.status(400).json({ message: "Task already claimed by you" });
    }

    task.assignedUsers.push(req.user._id);
    task.status = 'In Progress';
    await task.save();

    res.json({ message: "Task claimed successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Failed to claim task" });
  }
};

// @desc    Volunteer submits completed task
// @route   PUT /api/tasks/submit/:id
export const submitTask = async (req, res) => {
  try {
    const { submissionData } = req.body; // e.g., links or notes
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    
    task.status = 'Completed';
    task.submissionDetails = submissionData;
    await task.save();

    res.json({ message: "Task submitted for verification", task });
  } catch (error) {
    res.status(500).json({ message: "Submission failed" });
  }
};

// @desc    Secretary verifies task and awards XP
// @route   PUT /api/tasks/verify/:taskId
export const verifyTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // 1. Find the task and populate assigned users
    const task = await Task.findById(taskId).populate('assignedUsers');
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.status !== 'Completed') {
      return res.status(400).json({ message: "Only completed tasks can be verified" });
    }

    // 2. Update task status
    task.status = 'Verified';
    await task.save();

    // 3. Reward each assigned student and send Push Notification
    for (const volunteer of task.assignedUsers) {
      const student = await User.findById(volunteer._id);
      if (student) {
        // Award XP
        student.gamification.xpPoints += (task.xpReward || 20);
        
        // Bonus: Update verified tasks count in history if your schema supports it
        // student.history.tasks.push(task._id); 

        await student.save();

        // Send Push Notification if they are subscribed
        if (student.pushSubscription) {
          try {
            await sendPushNotification(
              student.pushSubscription,
              "Task Verified! ✅",
              `Well done! Your task "${task.title}" was verified. +${task.xpReward} XP added to your profile.`,
              "/profile"
            );
          } catch (pushErr) {
            console.error("Push notification failed for user:", student._id);
          }
        }
      }
    }

    res.status(200).json({ message: "Task verified and students notified!" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};