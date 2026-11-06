export type SkillModule = 'listening' | 'reading' | 'writing' | 'speaking';

export type QuestionType =
  | 'multiple_choice'
  | 'fill_in_the_blank'
  | 'matching_headings'
  | 'true_false_not_given'
  | 'map_labelling'
  | 'matching_features'
  | 'summary_completion'
  | 'writing_task1'
  | 'writing_task2'
  | 'speaking_cue_card';

export interface DistractorExplanation {
  option: string;
  isCorrect: boolean;
  explanation: string;
  trapType?: 'distractor_correction' | 'false_synonym' | 'opposite_claim' | 'unmentioned_detail';
}

export interface Question {
  id: string;
  number: number;
  section: number;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[]; // Single string or array of acceptable answers
  distractorNotes?: DistractorExplanation[];
  transcriptQuote?: string; // Exact sentence in audio script proving the answer
  instruction?: string; // e.g. "Write NO MORE THAN TWO WORDS AND/OR A NUMBER"
  targetParagraph?: string; // For reading headings or passage references
  imageMapUrl?: string; // For map / diagram questions
  explanation: string;
}

export interface TranscriptLine {
  id: string;
  speaker: string;
  timestamp: string; // e.g. "01:24"
  timeInSeconds: number;
  text: string;
  relatedQuestionNumber?: number;
}

export interface ListeningSection {
  sectionNumber: number;
  title: string;
  context: string;
  speakers: string[];
  audioScript: TranscriptLine[];
  audioUrl?: string; // Real human MP3 recording URL
  questions: Question[];
  durationEstimateSeconds: number;
}

export interface CambridgeTest {
  id: string;
  testNumber: number;
  title: string;
  sections: ListeningSection[];
}

export interface ReadingPassage {
  id: string;
  passageNumber: number;
  title: string;
  subtitle?: string;
  textParagraphs: { id: string; label: string; text: string }[];
  questions: Question[];
  recommendedTimeMinutes: number;
}

export interface WritingTask {
  id: string;
  taskNumber: 1 | 2;
  title: string;
  prompt: string;
  minWords: number;
  chartType?: 'bar_chart' | 'line_graph' | 'pie_chart' | 'process_diagram' | 'map_comparison';
  chartData?: {
    labels: string[];
    datasets: { label: string; data: number[]; color: string }[];
    title: string;
  };
  sampleAnswerBand8: string;
  examinerNotes: string[];
}

export interface SpeakingPart {
  partNumber: 1 | 2 | 3;
  title: string;
  description: string;
  prepTimeSeconds: number;
  speakTimeSeconds: number;
  questions: {
    id: string;
    prompt: string;
    followUps?: string[];
    sampleResponse?: string;
  }[];
  cueCard?: {
    topic: string;
    bulletPoints: string[];
  };
}

export interface QuestionTypeStrategy {
  type: QuestionType;
  title: string;
  module: SkillModule;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  examinerTips: string[];
  commonTraps: string[];
  stepByStepMethod: string[];
  sampleQuestionsCount: number;
}

export interface MilestoneNode {
  id: string;
  title: string;
  skill: SkillModule | 'all';
  description: string;
  targetBand: number;
  xpReward: number;
  iconName: string;
  requiredTasks: string[];
  isCompleted: boolean;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface ExamAttempt {
  id: string;
  date: string;
  title: string;
  module: SkillModule | 'full_mock';
  rawScore: number;
  totalQuestions: number;
  bandScore: number;
  timeSpentSeconds: number;
  questionTypeAccuracy?: Record<string, { correct: number; total: number }>;
}

export interface UserStats {
  targetBand: number;
  currentEstimatedBand: number;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedDrillCount: number;
  questionTypeAccuracy: Record<QuestionType, { correct: number; total: number }>;
  recentScores: { date: string; band: number; module: SkillModule }[];
  unlockedMilestones: string[];
}

export interface FullMockExamResult {
  id: string;
  date: string;
  candidateName: string;
  candidateNumber: string;
  testCenterCode: string;
  testType: string;
  listeningRaw: number;
  listeningBand: number;
  readingRaw: number;
  readingBand: number;
  writingBand: number;
  speakingBand: number;
  overallBand: number;
  cefrLevel: string;
  timeSpentSeconds: number;
  listeningAnswers: Record<string, string>;
  readingAnswers: Record<string, string>;
  writingTask1Text: string;
  writingTask2Text: string;
  questionDetails: {
    id: string;
    number: number;
    module: 'listening' | 'reading';
    part: number;
    prompt: string;
    userAnswer: string;
    correctAnswer: string | string[];
    isCorrect: boolean;
    explanation: string;
    flagged: boolean;
  }[];
}
