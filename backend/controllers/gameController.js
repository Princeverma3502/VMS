import User from '../models/User.js';

// @desc    Spin the Wheel (Daily Reward)
// @route   POST /api/game/spin
export const spinWheel = async (req, res) => {
  try {
    // Logic: Randomly determine XP reward
    const rewards = [10, 20, 50, 100];
    const randomXP = rewards[Math.floor(Math.random() * rewards.length)];

    // Update User
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { $inc: { 'gamification.xpPoints': randomXP } },
      { new: true }
    );

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      message: `You won ${randomXP} XP!`,
      xpAwarded: randomXP,
      totalXP: user.gamification?.xpPoints || 0,
      gamification: user.gamification || {}
    });
  } catch (error) {
    console.error("Spin Error:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Spin failed" });
  }
};

// @desc    Submit Trivia Answer
// @route   POST /api/game/trivia
export const submitTrivia = async (req, res) => {
  try {
    const { isCorrect } = req.body;

    if (isCorrect) {
      const reward = 20;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { 'gamification.xpPoints': reward } },
        { new: true }
      );

      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      res.status(200).json({
        success: true,
        message: 'Correct Answer!',
        xpAwarded: reward,
        totalXP: user.gamification?.xpPoints || 0
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'Wrong Answer. Better luck next time!'
      });
    }
  } catch (error) {
    console.error("Trivia Error:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Trivia failed" });
  }
};