import mongoose, { Document, Schema } from 'mongoose';

export type RiskLevel = 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Severe Burnout';

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  sleep: {
    hours: number;
    quality: string;
    consistency: string;
  };
  academicWorkload: {
    studyHours: number;
    assignmentLoad: string;
    hasExamSoon: boolean;
  };
  emotionalState: {
    stressLevel: number;
    anxietyLevel: number;
    motivationLevel: number;
    primaryMood: string;
  };
  physicalHealth: {
    exerciseFrequency: string;
    energyLevel: number;
    breakFrequency: string;
  };
  social: {
    socialInteraction: string;
    supportSystemAvailable: boolean;
  };
  productivity: {
    focusLevel: number;
    screenTime: number;
    procrastinationLevel: number;
  };
  results: {
    burnoutScore: number;
    riskLevel: RiskLevel;
    categoryScores: {
      sleep: number;
      academic: number;
      emotional: number;
      physical: number;
      social: number;
      productivity: number;
    };
    recommendations: string[];
    insights: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sleep: {
      hours: { type: Number, required: true, min: 0, max: 24 },
      quality: { type: String, required: true },
      consistency: { type: String, required: true },
    },
    academicWorkload: {
      studyHours: { type: Number, required: true },
      assignmentLoad: { type: String, required: true },
      hasExamSoon: { type: Boolean, default: false },
    },
    emotionalState: {
      stressLevel: { type: Number, required: true, min: 1, max: 10 },
      anxietyLevel: { type: Number, required: true, min: 1, max: 10 },
      motivationLevel: { type: Number, required: true, min: 1, max: 10 },
      primaryMood: { type: String, required: true },
    },
    physicalHealth: {
      exerciseFrequency: { type: String, required: true },
      energyLevel: { type: Number, required: true, min: 1, max: 10 },
      breakFrequency: { type: String, required: true },
    },
    social: {
      socialInteraction: { type: String, required: true },
      supportSystemAvailable: { type: Boolean, required: true },
    },
    productivity: {
      focusLevel: { type: Number, required: true, min: 1, max: 10 },
      screenTime: { type: Number, required: true },
      procrastinationLevel: { type: Number, required: true, min: 1, max: 10 },
    },
    results: {
      burnoutScore: { type: Number, required: true },
      riskLevel: {
        type: String,
        enum: ['Low Risk', 'Moderate Risk', 'High Risk', 'Severe Burnout'],
        required: true,
      },
      categoryScores: {
        sleep: Number,
        academic: Number,
        emotional: Number,
        physical: Number,
        social: Number,
        productivity: Number,
      },
      recommendations: [String],
      insights: [String],
    },
  },
  { timestamps: true }
);

AssessmentSchema.index({ userId: 1, createdAt: -1 });
AssessmentSchema.index({ userId: 1, 'results.riskLevel': 1, createdAt: -1 });

export const Assessment =
  mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
