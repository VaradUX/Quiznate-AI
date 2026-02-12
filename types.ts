
export enum ExamType {
  ACADEMIC = 'Academic Exam',
  CORPORATE = 'Company/Enterprise Interview',
  COMPETITIVE = 'Competitive Government Exam'
}

export enum QuestionFormat {
  MCQ = 'MCQ',
  MSQ = 'MSQ',
  WRITTEN = 'Written',
  AUDIO = 'Audio based'
}

export interface Question {
  id: string;
  type: QuestionFormat;
  question: string;
  options?: string[]; // For MCQ/MSQ
  correctAnswer?: string | string[];
  audioPrompt?: string; // For Audio based
}

export interface QuizConfig {
  type: ExamType;
  name: string;
  date: string;
  time: string;
  description: string;
  totalQuestions: number;
  isCustomDistribution: boolean;
  distribution: Record<QuestionFormat, number>;
}

export interface Group {
  id: string;
  name: string;
  candidatesCount: number;
}

export interface AppState {
  isAuthenticated: boolean;
  currentStep: 'dashboard' | 'creating' | 'previewing' | 'assigning';
  config: QuizConfig | null;
  generatedQuiz: Question[] | null;
  selectedGroups: string[];
}
