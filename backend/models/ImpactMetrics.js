import mongoose from 'mongoose';

const impactMetricsSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      unique: true,
      description: 'College-wide impact aggregation',
    },
    totalVolunteerHours: {
      type: Number,
      default: 0,
      description: 'Total service hours across all volunteers',
    },
    totalLifetimeXP: {
      type: Number,
      default: 0,
      description: 'Cumulative XP earned by all volunteers',
    },
    totalEventsCompleted: {
      type: Number,
      default: 0,
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },

    // Domain-Specific Metrics
    domainMetrics: {
      type: [
        {
          domainId: mongoose.Schema.Types.ObjectId,
          domainName: String,
          hoursContributed: Number,
          volunteersInvolved: Number,
          xpEarned: Number,
        },
      ],
      default: [],
    },
    
    // Impact Specifics
    metricsData: {
      type: {
        treesPlanted: { type: Number, default: 0 },
        bloodDonated: { type: Number, default: 0 }, // units
        peopleHelped: { type: Number, default: 0 },
        mealsServed: { type: Number, default: 0 },
        studentsCoached: { type: Number, default: 0 },
        firstAidResponsesProvided: { type: Number, default: 0 },
      },
      default: {},
    },
    
    // Geographic Coverage (for impact map)
    eventLocations: {
      type: [
        {
          eventId: mongoose.Schema.Types.ObjectId,
          eventName: String,
          coordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: [Number], // [longitude, latitude]
          },
          volunteersInvolved: Number,
          dateCompleted: Date,
        },
      ],
      default: [],
    },
    
    // Participation Diversity
    totalActiveVolunteers: {
      type: Number,
      default: 0,
    },
    repeatVolunteerPercentage: {
      type: Number,
      default: 0,
      description: 'Percentage attending 3+ events',
    },
    
    // Engagement Metrics
    averageXPPerVolunteer: {
      type: Number,
      default: 0,
    },
    averageHoursPerVolunteer: {
      type: Number,
      default: 0,
    },
    lastCalculatedAt: {
      type: Date,
      description: 'When these metrics were last aggregated',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ImpactMetrics', impactMetricsSchema);