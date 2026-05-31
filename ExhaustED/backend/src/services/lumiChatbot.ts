export type MoodCategory =
  | 'academic_pressure'
  | 'anxiety'
  | 'burnout'
  | 'exhaustion'
  | 'loneliness'
  | 'sadness'
  | 'stuck'
  | 'okay'
  | 'unknown';

export interface MajikConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface MajikResponse {
  reply: string;
  detectedMood: MoodCategory;
  suggestAssessment: boolean;
}

const KEYWORD_MOOD_MAP: Record<MoodCategory, string[]> = {
  academic_pressure: ['exam', 'quiz', 'test', 'deadline', 'assignment', 'project', 'grades', 'schoolwork', 'study'],
  anxiety: ['anxious', 'anxiety', 'panic', 'worried', 'worry', 'nervous', 'scared', 'overthinking', 'dread'],
  burnout: ['burned out', 'burnout', 'burnt out', 'breaking point', 'falling apart', 'giving up', 'hopeless'],
  exhaustion: ['tired', 'exhausted', 'fatigue', 'fatigued', 'sleepy', 'no energy', 'drained', 'worn out', 'sleep'],
  loneliness: ['lonely', 'alone', 'isolated', 'no friends', 'ignored', 'left out', 'by myself'],
  sadness: ['sad', 'unhappy', 'depressed', 'miserable', 'crying', 'empty', 'numb', 'hurt', 'low'],
  stuck: ['unmotivated', 'lazy', 'procrastinating', 'procrastinate', "can't focus", 'distracted', 'stuck', 'behind'],
  okay: ['okay', 'fine', 'alright', 'not bad', 'decent', 'managing', 'good', 'better'],
  unknown: [],
};

const OPENERS: Record<MoodCategory, string[]> = {
  academic_pressure: [
    'That sounds like a lot of pressure to carry, especially when school keeps asking for more before you have had time to recover.',
    'It makes sense that your mind feels crowded if deadlines or grades have been sitting on your chest.',
    'School pressure can start to feel personal, even when it is really a load problem, not a worth problem.',
  ],
  anxiety: [
    'That sounds really unsettling, like your brain is trying to protect you by running through every possible problem.',
    'Anxiety can make the future feel like it is already happening. No wonder your body feels on alert.',
    'That kind of worry can be exhausting because it does not always switch off when you want it to.',
  ],
  burnout: [
    'That sounds deeper than ordinary tiredness. It sounds like you have been pushing past your limits for a while.',
    'Burnout can make even simple things feel far away. That does not mean you are weak; it means your system needs care.',
    'If you are at the point where everything feels too much, we should treat that seriously and gently.',
  ],
  exhaustion: [
    'You seem drained, like your body has been asking for a pause but life has not made much room for one.',
    'That kind of tired can make every task feel heavier than it should. It is not just a motivation issue.',
    'If your energy is this low, it makes sense that everything feels harder to start.',
  ],
  loneliness: [
    'Feeling alone while trying to keep up with school can hurt in a very quiet way.',
    'That sounds lonely, and it can feel even heavier when everyone around you seems busy or okay.',
    'You deserve connection with this, not just more pressure to handle it privately.',
  ],
  sadness: [
    'That sounds painful to sit with. You do not have to turn it into a lesson or a plan right away.',
    'I am sorry it feels this heavy. Some days need comfort before they need solutions.',
    'That kind of sadness can make the whole day feel slower and harder than people realize.',
  ],
  stuck: [
    'Feeling stuck does not mean you are lazy. It often means your brain is overloaded or tired of starting from panic.',
    'Being behind can make starting feel almost impossible, because every task comes with guilt attached.',
    'That stuck feeling is frustrating. We can lower the pressure enough for one small step to become possible.',
  ],
  okay: [
    'I am glad you are still finding some steadiness. We can use that to protect your energy before things pile up again.',
    'Okay is a real place to be. It does not need to be dramatic for it to matter.',
    'If today is manageable, we can keep it gentle and make sure you do not spend all your energy at once.',
  ],
  unknown: [
    'I am here with you. You can say this messily; I will help you sort it without judging it.',
    'Tell me a little more about what has been happening today. We can start with feelings, tasks, or just the part that feels hardest.',
    'You reached out, and that matters. What feels most present right now: pressure, tiredness, worry, sadness, or something else?',
  ],
};

const NEXT_STEPS: Record<MoodCategory, string[]> = {
  academic_pressure: [
    'Want to tell me which task is taking up the most space right now?',
    'We can separate what is urgent from what only feels urgent.',
    'If you want, we can shrink the first task into something you can do in ten minutes.',
  ],
  anxiety: [
    'What is the worry saying might happen?',
    'Try staying with me for one slow breath, then tell me the most concrete part of the fear.',
    'Do you want grounding first, or do you want to unpack the thought?',
  ],
  burnout: [
    'What has been draining you the longest?',
    'Can we look at what can be reduced, delayed, or shared instead of asking you to push harder?',
    'If this has been going on for days or weeks, it may be worth telling someone safe at school or home.',
  ],
  exhaustion: [
    'Have you eaten, had water, or had even ten quiet minutes today?',
    'What is the smallest necessary thing left for today?',
    'Maybe the goal is not to catch up tonight, but to stop the day from taking even more from you.',
  ],
  loneliness: [
    'Is there one person who feels low-pressure enough to message?',
    'What kind of connection would feel safe right now: company, honesty, distraction, or help?',
    'Even a small reach-out counts. You do not need to explain everything perfectly.',
  ],
  sadness: [
    'Do you want to talk about what happened, or should we just stay with the feeling for a moment?',
    'What would feel like care tonight instead of another demand?',
    'If this sadness feels unsafe or unbearable, please reach out to someone nearby or a crisis support line right now.',
  ],
  stuck: [
    'What is one task we can make almost too small to fail?',
    'Can we choose the easiest starting point instead of the most important one?',
    'The first step can be opening the file, writing one sentence, or clearing one small space.',
  ],
  okay: [
    'What would help keep today steady?',
    'Is there anything you want to check in about before it becomes heavy?',
    'What is one small thing you can do now that future-you would appreciate?',
  ],
  unknown: [
    'What part of it feels hardest to say out loud?',
    'Would it help to talk through the situation, or just name the feeling first?',
    'I can stay with you while you find the words.',
  ],
};

const DAILY_TIPS = [
  'Drink a glass of water before your next study block. Dehydration makes focus feel harder than it needs to be.',
  'Take five slow breaths before opening the next task. Your nervous system deserves a transition.',
  'Step away from the screen for 5 minutes if your thoughts are looping. Movement helps your brain reset.',
  'Make your next task smaller than your stress says it should be. Small starts still count.',
  'If you have skipped a meal, eat something simple before judging your motivation.',
];

function pickFresh(options: string[], recentAssistantText: string): string {
  const available = options.filter((option) => !recentAssistantText.includes(option.slice(0, 42)));
  const pool = available.length ? available : options;
  return pool[Math.floor(Math.random() * pool.length)];
}

function contextBridge(recentMessages: MajikConversationMessage[]): string {
  const userMessages = recentMessages.filter((message) => message.role === 'user').slice(-3);
  if (userMessages.length < 2) return '';

  const previous = userMessages[userMessages.length - 2]?.content;
  if (!previous) return '';

  const shortened = previous.length > 72 ? `${previous.slice(0, 69)}...` : previous;
  return `Earlier you mentioned "${shortened}", so I do not want to treat this like a random new problem. `;
}

export class MajikChatbotService {
  static detectMood(text: string): MoodCategory {
    const lower = text.toLowerCase();

    for (const [mood, keywords] of Object.entries(KEYWORD_MOOD_MAP)) {
      if (mood === 'unknown') continue;
      if (keywords.some((keyword) => lower.includes(keyword))) {
        return mood as MoodCategory;
      }
    }

    return 'unknown';
  }

  static generateResponse(userMessage: string, recentMessages: MajikConversationMessage[] = []): MajikResponse {
    const detectedMood = this.detectMood(userMessage);
    const recentAssistantText = recentMessages
      .filter((message) => message.role === 'assistant')
      .slice(-5)
      .map((message) => message.content)
      .join(' ');
    const opener = pickFresh(OPENERS[detectedMood], recentAssistantText);
    const nextStep = pickFresh(NEXT_STEPS[detectedMood], recentAssistantText);
    const suggestAssessment = ['academic_pressure', 'anxiety', 'burnout', 'exhaustion', 'stuck'].includes(detectedMood);

    return {
      reply: `${contextBridge(recentMessages)}${opener} ${nextStep}`,
      detectedMood,
      suggestAssessment,
    };
  }

  static getDailyTip(): string {
    return DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
  }

  static getWelcomeMessage(): string {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return `${greeting}. I'm Majik. You can bring the messy version of what you feel here; we can make it gentler and more manageable together.`;
  }
}

export { MajikChatbotService as MiraChatbotService };
