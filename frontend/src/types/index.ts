export interface User {
  _id?: string;
  name: string;
  email?: string;
  isGhost?: boolean;
}

export interface Interview {
  _id: string;
  userId: string | User;
  jobTitle: string;
  techStack: string[];
  experienceLevel: string;
  duration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evaluation {
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
  experienceLevel: string;
  duration: number;
  icon?: React.ReactNode; 
}
