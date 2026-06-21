export interface Subject {
  id?: number;
  subjectName: string;
  description: string;
}

export interface Answer {
  id?: number;
  answerContent: string;
  isCorrect: boolean;
}

export interface Question {
  id?: number;
  content: string;
  subjectId: number;
  difficultyLevel: string;
  answers: Answer[];
}

export interface Exam {
  id?: number;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: string;
  questionIds?: number[];
  questions?: Question[];
}

export interface ExamSubmission {
  examId: number;
  answers: { questionId: number; selectedAnswerId: number }[];
}

export interface ExamResult {
  attemptId: number;
  examId: number;
  examTitle: string;
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalQuestions: number;
  submitTime: string;
}
