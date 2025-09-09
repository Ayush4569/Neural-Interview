import bcrypt from "bcrypt";
import { ai } from "../service/gemini.service";
import { summary } from "../types/interview";
export const hashPassword = async (password: string): Promise<string> => await bcrypt.hash(password, 10);

export const calculateFinalInterviewScore = async (summary: summary): Promise<number | null> => {

    try {
        if (!summary) {
            return null;
        }
        const prompt = `
    Based on the following interview summary, calculate an overall score (0-100):
    
    Technical Score: ${summary.technicalScore}/100
    Communication Score: ${summary.communicationScore}/100
    
    Strengths: ${summary.strengths.join(', ')}
    Areas for Improvement: ${summary.improvements.join(', ')}
    
    Overall Summary: ${summary.overallSummary}
    
    Consider:
    - Technical competency (40% weight)
    - Communication skills (30% weight) 
    - Problem-solving approach (20% weight)
    - Growth potential shown in strengths (10% weight)
    
    Return only a number between 0-100.
    `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        })

        if (!response || !response.text) {
            return null
        }
        return parseInt(response.text)
    } catch (error) {
        console.log('Error generating score', error);
        return null;
    }
}