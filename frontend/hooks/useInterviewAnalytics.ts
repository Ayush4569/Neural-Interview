import { Interview } from "@/types/globalTypes";
import { useMemo } from "react";
export const useInterviewStats = (interviews: Interview[],isPending:boolean,isError:boolean) => {
    return useMemo(() => {
        if (!interviews || isPending || isError) {
            return {
                upcomingInterviews: [],
                pastInterviews: [],
                avgScore: 0,
                totalInterviews: 0
            };
        }
        const upcoming = interviews.filter(({type}) => type === 'upcoming');
        const past = interviews.filter(({type}) => type === 'past');
        
        const completedWithScores = past.filter(interview => 
            interview.score != null && interview.score >= 0
        );
        
        const totalScore = completedWithScores.reduce((acc, interview) => 
            acc + interview.score, 0
        );
        
        const avgScore = completedWithScores.length > 0 
            ? Math.round(totalScore / completedWithScores.length) 
            : 0;
        
        return {
            upcomingInterviews: upcoming,
            pastInterviews: past,
            avgScore,
            totalInterviews: interviews.length,
            completedInterviews: completedWithScores.length
        };
    }, [interviews]);
};