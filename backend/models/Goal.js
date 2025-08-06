const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['anxiety', 'sleep', 'stress', 'mood', 'social', 'mindfulness', 'exercise', 'habits', 'custom']
  },
  description: {
    type: String,
    trim: true
  },
  target: {
    type: String,
    required: true,
    trim: true
  },
  targetValue: {
    type: Number, // For measurable goals (e.g., 50% reduction, 8 hours sleep)
  },
  targetUnit: {
    type: String, // e.g., 'hours', 'minutes', 'percentage', 'days'
  },
  timeframe: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'daily'
  },
  deadline: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'adjusted'],
    default: 'active'
  },
  
  // Daily/Weekly Progress Tracking
  dailyLogs: [{
    date: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    },
    value: Number, // Actual value logged (e.g., 7 hours of sleep, 10 minutes meditation)
    mood: {
      type: Number,
      min: 1,
      max: 10
    },
    challenges: [String],
    notes: String,
    reflection: String
  }],
  
  // Weekly summaries
  weeklySummaries: [{
    weekStart: Date,
    weekEnd: Date,
    completionRate: Number,
    averageMood: Number,
    totalValue: Number,
    achievements: [String],
    challenges: [String],
    aiSuggestions: [String]
  }],
  
  milestones: [{
    description: String,
    targetDate: Date,
    targetValue: Number,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    celebrationMessage: String
  }],
  
  // AI Feedback and Suggestions
  aiFeedback: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['encouragement', 'suggestion', 'reminder', 'adjustment', 'celebration', 'resource', 'support']
    },
    message: String,
    data: mongoose.Schema.Types.Mixed // Additional data for suggestions
  }],
  
  // Reminders and Notifications
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily'
    },
    time: String, // e.g., "09:00", "18:30"
    message: String,
    customSchedule: [String] // For custom reminder times
  },
  
  // Goal Adjustments History
  adjustments: [{
    date: {
      type: Date,
      default: Date.now
    },
    oldTarget: String,
    newTarget: String,
    reason: String,
    aiSuggested: Boolean
  }],
  
  // Achievements and Badges
  achievements: [{
    name: String,
    description: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  
  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  
  // Resources suggested by AI
  suggestedResources: [{
    title: String,
    type: {
      type: String,
      enum: ['article', 'video', 'exercise', 'technique', 'app']
    },
    url: String,
    description: String,
    relevantFor: String // What challenge this helps with
  }]
}, {
  timestamps: true
});

// Indexes for better performance
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ deadline: 1 });
goalSchema.index({ 'dailyLogs.date': 1 });

// Virtual for current week completion rate
goalSchema.virtual('weeklyCompletionRate').get(function() {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const thisWeekLogs = this.dailyLogs.filter(log => 
    log.date >= weekStart && log.date <= weekEnd
  );
  
  if (thisWeekLogs.length === 0) return 0;
  
  const completedDays = thisWeekLogs.filter(log => log.completed).length;
  return Math.round((completedDays / thisWeekLogs.length) * 100);
});

// Method to log daily progress
goalSchema.methods.logDailyProgress = function(logData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if already logged today
  const existingLog = this.dailyLogs.find(log => {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  });
  
  if (existingLog) {
    // Update existing log
    Object.assign(existingLog, logData);
  } else {
    // Add new log
    this.dailyLogs.push({
      ...logData,
      date: today
    });
  }
  
  // Update streak
  this.updateStreak();
  
  // Update overall progress
  this.calculateProgress();
  
  // Return the document (don't auto-save)
  return this;
};

// Method to update streak
goalSchema.methods.updateStreak = function() {
  const sortedLogs = this.dailyLogs
    .filter(log => log.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (sortedLogs.length === 0) {
    this.currentStreak = 0;
    return;
  }
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    logDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  this.currentStreak = streak;
  if (streak > this.longestStreak) {
    this.longestStreak = streak;
  }
};

// Method to calculate overall progress
goalSchema.methods.calculateProgress = function() {
  const now = new Date();
  const start = this.createdAt;
  const completedLogsCount = this.dailyLogs.filter(log => log.completed).length;

  console.log('--- calculateProgress Debug ---');
  console.log('Goal Title:', this.title);
  console.log('createdAt:', start);
  console.log('deadline:', this.deadline);
  console.log('timeframe:', this.timeframe);
  console.log('targetUnit:', this.targetUnit);
  console.log('targetValue:', this.targetValue);
  console.log('completedLogsCount:', completedLogsCount);

  if (this.deadline) {
    const end = this.deadline;
    const totalDurationDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    console.log('Branch: deadline exists');
    console.log('totalDurationDays:', totalDurationDays);

    if (totalDurationDays <= 0) {
      this.progress = completedLogsCount > 0 ? 100 : 0;
    } else {
      this.progress = Math.min(100, Math.round((completedLogsCount / totalDurationDays) * 100));
    }
  } else if (this.timeframe === 'daily' && this.targetUnit === 'days' && this.targetValue > 0) {
    console.log('Branch: daily with target days');
    this.progress = Math.min(100, Math.round((completedLogsCount / this.targetValue) * 100));
  } else {
    console.log('Branch: fallback/general daily');
    const conceptualTotalDays = 30;
    this.progress = Math.min(100, Math.round((completedLogsCount / conceptualTotalDays) * 100));
    console.log('conceptualTotalDays used:', conceptualTotalDays);
  }

  this.progress = Math.max(0, this.progress);
  console.log('Final calculated progress:', this.progress);
  console.log('-----------------------------');
};

// Method to add AI feedback
goalSchema.methods.addAIFeedback = function(type, message, data = null) {
  this.aiFeedback.push({
    type,
    message,
    data
  });
  
  // Keep only last 50 feedback items
  if (this.aiFeedback.length > 50) {
    this.aiFeedback = this.aiFeedback.slice(-50);
  }
  
  return this.save();
};

// Method to suggest goal adjustment
goalSchema.methods.suggestAdjustment = function(newTarget, reason) {
  return this.addAIFeedback('adjustment', 
    `Consider adjusting your goal: ${reason}`, 
    { suggestedTarget: newTarget, currentTarget: this.target }
  );
};

// Method to unlock achievement
goalSchema.methods.unlockAchievement = function(achievement) {
  const exists = this.achievements.find(a => a.name === achievement.name);
  if (!exists) {
    this.achievements.push(achievement);
    this.addAIFeedback('celebration', 
      `🎉 Achievement Unlocked: ${achievement.name}! ${achievement.description}`
    );
  }
  return this.save();
};

// Static method to get user's goal analytics
goalSchema.statics.getAnalytics = function(userId, timeRange = 'week') {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  
  return this.aggregate([
    { $match: match },
    {
      $project: {
        title: 1,
        category: 1,
        progress: 1,
        currentStreak: 1,
        longestStreak: 1,
        dailyLogs: 1,
        status: 1,
        weeklyCompletion: {
          $avg: {
            $map: {
              input: '$dailyLogs',
              as: 'log',
              in: { $cond: ['$$log.completed', 1, 0] }
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Goal', goalSchema);
