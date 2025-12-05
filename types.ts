
export interface SubjectScore {
  subjectName: string;
  score: number; // 0-100
  fullScore: number;
  grade: string; // 4, 3.5, 3, etc. or A, B, C
  category: 'Science' | 'Math' | 'Language' | 'Social' | 'Art' | 'Activity';
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  semester: string;
  academicYear: string; // New field for managing years
  image: string;
  scores: SubjectScore[];
  gpa: number;
  teachers: string[];
  director: string;
}

export interface AnalysisState {
  isLoading: boolean;
  content: string | null;
  error: string | null;
}
