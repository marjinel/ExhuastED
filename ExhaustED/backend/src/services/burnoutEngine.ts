import { RiskLevel } from '../models/Assessment';

interface AssessmentInput {
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
}

interface BurnoutResult {
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
}

// ─── Scoring Functions ─────────────────────────────────────────────────────────

function scoreSleep(sleep: AssessmentInput['sleep']): number {
  let score = 0;

  // Sleep hours
  if (sleep.hours >= 7 && sleep.hours <= 9) score += 0;
  else if (sleep.hours >= 5 && sleep.hours < 7) score += 2;
  else if (sleep.hours >= 9) score += 1; // oversleeping slight risk
  else score += 5; // under 5 hours

  // Sleep quality
  const qualityMap: Record<string, number> = {
    'Excellent': 0,
    'Good': 1,
    'Average': 2,
    'Poor': 3,
    'Very Poor': 5,
  };
  score += qualityMap[sleep.quality] ?? 2;

  // Consistency
  const consistencyMap: Record<string, number> = {
    'Very consistent': 0,
    'Mostly consistent': 1,
    'Irregular': 3,
    'Very irregular': 5,
  };
  score += consistencyMap[sleep.consistency] ?? 2;

  return Math.min(score, 15);
}

function scoreAcademic(academic: AssessmentInput['academicWorkload']): number {
  let score = 0;

  // Study hours
  if (academic.studyHours <= 4) score += 0;
  else if (academic.studyHours <= 7) score += 2;
  else if (academic.studyHours <= 10) score += 4;
  else score += 6;

  // Assignment load
  const loadMap: Record<string, number> = {
    'Light': 0,
    'Moderate': 2,
    'Heavy': 4,
    'Overwhelming': 7,
  };
  score += loadMap[academic.assignmentLoad] ?? 2;

  // Exam soon
  if (academic.hasExamSoon) score += 3;

  return Math.min(score, 16);
}

function scoreEmotional(emotional: AssessmentInput['emotionalState']): number {
  let score = 0;

  // Stress level
  if (emotional.stressLevel <= 3) score += 1;
  else if (emotional.stressLevel <= 6) score += 3;
  else if (emotional.stressLevel <= 8) score += 5;
  else score += 7;

  // Anxiety
  if (emotional.anxietyLevel <= 3) score += 0;
  else if (emotional.anxietyLevel <= 6) score += 2;
  else score += 4;

  // Motivation (inverted — low motivation = higher score)
  score += Math.round((10 - emotional.motivationLevel) / 2);

  // Primary mood
  const moodMap: Record<string, number> = {
    'Motivated': 0,
    'Happy': 0,
    'Okay': 1,
    'Tired': 2,
    'Anxious': 3,
    'Overwhelmed': 4,
    'Burned Out': 6,
  };
  score += moodMap[emotional.primaryMood] ?? 2;

  return Math.min(score, 20);
}

function scorePhysical(physical: AssessmentInput['physicalHealth']): number {
  let score = 0;

  // Exercise frequency
  const exerciseMap: Record<string, number> = {
    'Daily': 0,
    '3-4x': 1,
    '1-2x': 2,
    'None': 4,
  };
  score += exerciseMap[physical.exerciseFrequency] ?? 2;

  // Energy level (inverted)
  score += Math.round((10 - physical.energyLevel) / 2);

  // Break frequency
  const breakMap: Record<string, number> = {
    'Regular': 0,
    'Rare': 3,
    'None': 5,
  };
  score += breakMap[physical.breakFrequency] ?? 2;

  return Math.min(score, 14);
}

function scoreSocial(social: AssessmentInput['social']): number {
  let score = 0;

  const socialMap: Record<string, number> = {
    'Active': 0,
    'Moderate': 1,
    'Minimal': 3,
    'Isolated': 5,
  };
  score += socialMap[social.socialInteraction] ?? 2;

  if (!social.supportSystemAvailable) score += 3;

  return Math.min(score, 10);
}

function scoreProductivity(productivity: AssessmentInput['productivity']): number {
  let score = 0;

  // Focus (inverted)
  score += Math.round((10 - productivity.focusLevel) / 2);

  // Screen time (non-study)
  if (productivity.screenTime <= 2) score += 0;
  else if (productivity.screenTime <= 4) score += 1;
  else if (productivity.screenTime <= 6) score += 3;
  else score += 5;

  // Procrastination
  if (productivity.procrastinationLevel <= 3) score += 0;
  else if (productivity.procrastinationLevel <= 6) score += 2;
  else score += 4;

  return Math.min(score, 15);
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'Low Risk';
  if (score <= 40) return 'Moderate Risk';
  if (score <= 60) return 'High Risk';
  return 'Severe Burnout';
}

function generateRecommendations(
  input: AssessmentInput,
  categoryScores: BurnoutResult['categoryScores']
): string[] {
  const recs: string[] = [];

  if (categoryScores.sleep >= 5) {
    recs.push('Prioritize 7–9 hours of sleep. Poor sleep amplifies every other burnout factor by up to 40%.');
    recs.push('Create a consistent sleep schedule — aim to sleep and wake at the same time daily, even on weekends.');
  }

  if (categoryScores.academic >= 8) {
    recs.push('Break large tasks into 25-minute focused sessions using the Pomodoro Technique to prevent overwhelm.');
    recs.push("Speak with your academic advisor about managing your current course load — you don't have to do this alone.");
  }

  if (categoryScores.emotional >= 10) {
    recs.push('Practice the 4-7-8 breathing technique: inhale 4 sec, hold 7 sec, exhale 8 sec. Repeat 3 times daily.');
    recs.push('Consider journaling for 5 minutes before bed — externalizing thoughts significantly reduces anxiety.');
  }

  if (input.physicalHealth.breakFrequency !== 'Regular') {
    recs.push('Set a timer to take a 10-minute break every 45 minutes. Stand up, walk, stretch — your brain needs it.');
  }

  if (input.physicalHealth.exerciseFrequency === 'None') {
    recs.push('Even a 20-minute daily walk reduces cortisol levels. Start small — a short walk is better than nothing.');
  }

  if (!input.social.supportSystemAvailable) {
    recs.push("Reach out to your university's counseling service. Speaking to a professional can provide a new perspective.");
  }

  if (categoryScores.productivity >= 7) {
    recs.push('Reduce non-study screen time by enabling app timers on social media apps. Small limits add up.');
  }

  // Always include a general positive recommendation
  recs.push('Acknowledge your efforts daily — progress, not perfection, is what matters. Be kind to yourself.');

  return recs.slice(0, 5); // Limit to 5 most relevant
}

function generateInsights(
  input: AssessmentInput,
  score: number,
  categoryScores: BurnoutResult['categoryScores']
): string[] {
  const insights: string[] = [];

  const riskLevel = getRiskLevel(score);

  if (riskLevel === 'Severe Burnout') {
    insights.push('Your current pattern shows signs of severe burnout. Immediate action is needed to prevent health impacts.');
  } else if (riskLevel === 'High Risk') {
    insights.push('You are at high risk of burnout. Addressing sleep and stress now can prevent progression to severe burnout.');
  } else if (riskLevel === 'Moderate Risk') {
    insights.push('You are managing, but your body is showing early warning signs. Small consistent changes will help.');
  } else {
    insights.push('You are maintaining good wellness balance. Keep up your healthy habits!');
  }

  if (input.sleep.hours < 6) {
    insights.push(`Sleeping ${input.sleep.hours} hours is below the 7-hour minimum for optimal cognitive function and emotional regulation.`);
  }

  if (input.emotionalState.stressLevel >= 7 && input.emotionalState.motivationLevel <= 4) {
    insights.push('High stress combined with low motivation is a classic early-stage burnout indicator. Rest and recovery are essential.');
  }

  if (input.academicWorkload.studyHours > 8) {
    insights.push(`Studying ${input.academicWorkload.studyHours} hours daily without adequate breaks leads to diminishing returns and increased error rates.`);
  }

  return insights;
}

// ─── Main Engine ───────────────────────────────────────────────────────────────

export class BurnoutDetectionEngine {
  static analyze(input: AssessmentInput): BurnoutResult {
    const categoryScores = {
      sleep: scoreSleep(input.sleep),
      academic: scoreAcademic(input.academicWorkload),
      emotional: scoreEmotional(input.emotionalState),
      physical: scorePhysical(input.physicalHealth),
      social: scoreSocial(input.social),
      productivity: scoreProductivity(input.productivity),
    };

    const totalRaw =
      categoryScores.sleep +
      categoryScores.academic +
      categoryScores.emotional +
      categoryScores.physical +
      categoryScores.social +
      categoryScores.productivity;

    // Normalize to 100-point scale
    const maxPossible = 15 + 16 + 20 + 14 + 10 + 15; // 90
    const burnoutScore = Math.round((totalRaw / maxPossible) * 100);

    const riskLevel = getRiskLevel(burnoutScore);
    const recommendations = generateRecommendations(input, categoryScores);
    const insights = generateInsights(input, burnoutScore, categoryScores);

    return {
      burnoutScore,
      riskLevel,
      categoryScores,
      recommendations,
      insights,
    };
  }
}
