import bcrypt from "bcrypt";
import { ai } from "../service/gemini.service";
import crypto from 'crypto'
import { summary } from "../types/interview";
import { Interview } from "types/interview";
import jwt from "jsonwebtoken";
type partialInterview = Pick<Interview, 'jobTitle' | 'techStack' | 'additionalPrompt' | 'durationMinutes' | 'expLevel'>


export const hashPassword = async (password: string): Promise<string> => await bcrypt.hash(password, 10);


export const canonicalizeAssistant = (assitantConfig: unknown): string => {
  return JSON.stringify(assitantConfig, Object.keys(assitantConfig as any).sort())
}

export const assistantLockHash = (input: string): string => {
  return crypto.createHash("sha256").update(input).digest("hex")
}

export const mintVapiWebToken = (interviewId: string, userId: string, ttLs?: number, assistantLockHash?: string, jti?: string) => {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: `user:${userId}`,
    interviewId: interviewId,
    maxUses: 1,
    aud: "web",
    iat: now,
    expiry: ttLs ? now + ttLs : now + 600,
    ...(assistantLockHash ? { assistantLockHash } : {}),
    ...(jti ? { jti } : {})
  }

  return jwt.sign(payload, process.env.VAPI_KEY!, { algorithm: "HS256" })
}
export const generateInterviewConfig = (interview: partialInterview) => {
  return {
    assistant: {
      name: `${interview.jobTitle} Interview Assistant`,
      model: {
        provider: 'deep-seek',
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are conducting a ${interview.jobTitle} interview.
                            
                INTERVIEW DETAILS:
                - Position: ${interview.jobTitle}
                - Tech Stack: ${interview.techStack}
                - Experience Level: ${interview.expLevel}
                - Duration: ${interview.durationMinutes} minutes
                - Special Instructions: ${interview.additionalPrompt || 'Standard interview'}
                            
                GUIDELINES:
                - Ask one question at a time
                - Allow candidate to finish responses
                - Adapt difficulty based on answers
                - Professional and encouraging tone
                - End gracefully when time is up
                            
                Start with a warm welcome and introduction.`
          },
        ],
        maxTokens: 300,
        temperature: 0.5,
      },
      voice: {
        provider: 'vapi',
        voiceId: 'Elliot'
      },
      firstMessage: `Hello! Welcome to your ${interview.jobTitle} interview. I'm your AI interviewer today. This will be a ${interview.durationMinutes}-minute conversation about your experience with ${interview.techStack}. Are you ready to begin?`,
      maxDurationSeconds: interview.durationMinutes * 60,
      silenceTimeoutSeconds: 30,
      endCallMessage: "Thank you for taking the time to participate in this interview. This concludes our session. It was great learning more about your background and experience. You will receive follow-up summary regarding your performance shortly. Wishing you the very best in your career journey.",
      endCallPhrases: [
        "I'm done",
        "That's all",
        "Let's wrap up",
        "We can stop here",
        "End the interview",
        "That’s enough for now",
        "I think we're finished",
        "We can conclude",
        "Please end the session",
        "That’s it from my side"
      ]
    }
  }
}

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