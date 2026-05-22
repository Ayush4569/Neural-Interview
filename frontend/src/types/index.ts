export interface User {
  _id: string;
  username: string;
  email: string;
  isGhost: boolean;
  interviewCount: number;
}

export interface Interview {
  _id: string;
  jobTitle: string;
  techStack: string[];
  experienceLevel: "0-1" | "1-3" | "3-5" | "5+";
  plannedDuration: number; 
  actualDuration: number;
  optionalPrompt?: string;
  scheduledAt: Date;
  status: "scheduled" | "live" | "completed" | "failed" | "expired";
  startTime?: Date;
  endTime?: Date;
  errorReason?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evaluation {
  _id: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface Template {
  id: string;
  jobTitle: string;
  techStack: string;
  experienceLevel: "0-1" | "1-3" | "3-5" | "5+" ;
  duration: number;
  icon?: React.ReactNode; 
}
