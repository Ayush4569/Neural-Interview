export interface TimeState {
    hour: string;
    minute: string;
}
interface InterviewSummary {
    overallSummary:string
    strengths:string[]        
    improvements : string[]        
    technicalScore:number          
    communicationScore:number   
}
export interface Interview {
    id: string;
    startTime: Date;
    endTime: Date;
    techStack: string; 
    durationMinutes: number; 
    expLevel: 'fresher'|'mid'|'lead'|'senior'; 
    status: 'scheduled' | 'completed' | 'active' | 'expired';
    jobTitle: string; 
    createdAt: Date;
    additionalPrompt?: string; 
    summary: InterviewSummary
    userId: string;
}