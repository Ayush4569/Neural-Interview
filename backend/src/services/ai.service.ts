import dotenv from "dotenv";
import OpenAI from "openai";
import z from "zod";

dotenv.config({ path: "./.env" });

const openAI = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY as string
})

type TranscriptMessage = {
  role: "ai" | "user";
  text: string;
  createdAt: Date;
}

type GenerateQuestionParams = {
  jobTitle: string;
  techStack: string[];
  transcript: TranscriptMessage[];
  experienceLevel: "0-1" | "1-3" | "3-5" | "5+";
  optionalPrompt: string | undefined;
}

const evaluationSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().min(1, "Feeback cannot be empty"),
  strengths: z.array(z.string()).min(1, "Must have some strength"),
  weaknesses: z.array(z.string()),
  improvements: z.array(z.string())
})

export class AiService {
  maxRecentMessages: number;
  constructor() {
    this.maxRecentMessages = 10;
  }
  async generateQuestions(
    { jobTitle,
      techStack,
      experienceLevel,
      optionalPrompt,
      transcript
    }: GenerateQuestionParams
  )
    : Promise<{ success: boolean, question: string, error: string | null }> {

    const previousQuestions = transcript
                              .filter(msg => msg.role === "ai")
                              .map(msg => msg.text)
                              .join("\n");

    const recentTranscript = transcript
      .slice(-this.maxRecentMessages)
      .map((t) => `${t.role === "ai" ? "Interviewer" : "Candidate"}: ${t.text}`)
      .join("\n");
    try {
      const prompt = `
You are an experienced technical interviewer.

Your job is to conduct a realistic interview for the following candidate.

JOB TITLE:
${jobTitle}

TECH STACK:
${techStack.join(", ")}

EXPERIENCE LEVEL:
${experienceLevel}

${optionalPrompt ? `
ADDITIONAL REQUIREMENTS:
${optionalPrompt}
` : ""}

PREVIOUS QUESTIONS ASKED:
${previousQuestions}

Transcript of the interview so far:
${recentTranscript}

INSTRUCTIONS:

1. Generate exactly ONE interview question.
2. The question must be relevant to the job title and tech stack.
3. Adjust difficulty according to the experience level.
4. Ask a follow-up question when appropriate.
5. Never repeat a previous question.
6. Do not ask coding implementation questions.
7. Do not ask multiple questions at once.
8. Keep the question under 30 words.
9. Return ONLY the question text.
10. Do not include greetings, explanations, markdown, numbering or bullet points.
11. If the candidate answer is weak, ask a probing follow-up.
12. If the candidate answer is strong, gradually increase difficulty.`;

      const response = await openAI.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: "You are a helpful and precise assistant for generating interview questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      })

      const text = response.choices[0]?.message.content;
      if (!text) {
        throw new Error("AI returned empty response");
      }

      return { success: true, question: text, error: null }
    } catch (error: any) {
      console.log("Error generating questions", error);
      return { success: false, error: error.message || "Error generating question", question: "" }
    }
  }
  async evaluateInterview(transcript: TranscriptMessage[]) {

    try {
      const prompt = `
      You are an expert technical interviewer and hiring manager.

      Your task is to evaluate a candidate's interview performance based on the interview transcript.

      Interview Transcript:
      ${transcript
          .map(message => `${message.role.toUpperCase()}: ${message.text}`)
          .join("\n")
        }

      Evaluation Instructions:

      1. Evaluate the candidate's technical knowledge, problem-solving ability, communication skills, and depth of understanding.
      2. Consider the candidate's experience level when scoring.
      3. Do not penalize candidates for not knowing advanced concepts beyond their experience level.
      4. Score the candidate on a scale from 0 to 100.
      5. Provide balanced and constructive feedback.
      6. Strengths should highlight what the candidate did well.
      7. Weaknesses should identify areas where knowledge was lacking or answers were incomplete.
      8. Improvements should provide actionable recommendations the candidate can follow.
      9. Feedback should be professional, concise, and specific to the interview.

      `

      const response = await openAI.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: `
            You are a helpful and precise assistant for evaluating interview performance.
            Return ONLY valid JSON.
            {
              "score": number,
              "feedback": string,
              "strengths": string[],
              "weaknesses": string[],
              "improvements": string[]
            }
            `
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
      
    
      const text = response.choices[0]?.message.content;
      if (!text) {
        throw new Error("AI returned empty response");
      }
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("AI returned invalid JSON");
      }

      if (!evaluationSchema.safeParse(parsed).success) {
        throw new Error("Invalid evaluation schema");
      }


      return {
        success: true,
        error: null,
        result: parsed
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error generating question",
        result: null
      }
    }
  }

}
