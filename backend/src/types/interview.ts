export type summary = {
    overallSummary: string
    strengths: string[]
    improvements: string[]
    technicalScore: number
    communicationScore: number
    finalAiScore: number
}

export interface Interview {
    id: string;
    startTime: Date;
    endTime: Date;
    techStack: string;
    durationMinutes: number;
    expLevel: 'fresher' | 'mid' | 'lead' | 'senior' | 'junior';
    status: 'scheduled' | 'completed' | 'active' | 'expired';
    jobTitle: string;
    createdAt: Date;
    type: 'past' | 'upcoming';
    score:number
    additionalPrompt: string | null;
    summary: summary
    userId: string;
}