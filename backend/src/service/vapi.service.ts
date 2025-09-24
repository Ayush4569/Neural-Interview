import { VapiClient } from "@vapi-ai/server-sdk";
import { Interview } from "types/interview";

type CreateInterview = Pick<Interview, 'jobTitle' | 'techStack' | 'additionalPrompt' | 'durationMinutes' | 'expLevel'>

class VapiService {
  vapi: VapiClient | undefined = undefined
  constructor() {
    this.vapi = new VapiClient({ token: process.env.VAPI_API_KEY as string });
  }

  async createInterviewSession(interview: CreateInterview) {
    if (!this.vapi) return null;
    const session = await this.vapi.sessions.create({
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

      },
      expirationSeconds:60*60
    })

    return {
      sessionId: session.id
    }
  }
}

export const vapiService = new VapiService()