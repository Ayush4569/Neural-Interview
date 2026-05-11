import { GoogleGenAI } from "@google/genai";

import ErrorResponse from "../utils/errorResponse.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const handleAIError = (error: any) => {
  console.error("AI Error:", error);
  const message = error?.message?.toLowerCase() || "";
  if (
    error?.status === 429 ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("429")
  ) {
    throw new ErrorResponse(
      "AI service rate limit exceeded. Please wait a moment and try again.",
      429,
    );
  }
  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("503")
  ) {
    throw new ErrorResponse(
      "AI network error. Please check your connection or try again.",
      503,
    );
  }
  throw new ErrorResponse("AI Service is currently unavailable.", 500);
};

export const generateInterviewQuestion = async (
  jobTitle: string,
  techStack: string[],
  experienceLevel: string,
  transcript: { role: string; text: string }[],
) => {
  // 1. Question Anchoring: Extract all previous AI questions to prevent repetition
  const previousQuestions = transcript
    .filter((t) => t.role === "ai")
    .map((t) => `- ${t.text}`)
    .join("\n");

  // 2. Sliding Window: Keep only the most recent 6 messages (3 turns) for immediate context
  const MAX_RECENT_MESSAGES = 6;
  const recentTranscript = transcript
    .slice(-MAX_RECENT_MESSAGES)
    .map((t) => `${t.role === "ai" ? "Interviewer" : "Candidate"}: ${t.text}`)
    .join("\n");

  let prompt = `
    You are an expert technical interviewer for the position of ${jobTitle}.
    The candidate has experience with: ${techStack.join(", ")}.
    Their level is ${experienceLevel}.

    Rules:
    - Keep questions concise and professional.
    - Ask ONE question at a time.
    - The interview MUST start with the candidate introducing themselves. Ask specifically for their name and a brief professional background before diving into technical questions.
    - If the user has introduced themselves, proceed to technical evaluation and ask a follow-up or a new question.
    - Do not provide the answer to your own questions unless asked for feedback.
${previousQuestions ? `    - IMPORTANT: Do not repeat any of the following previously asked questions:\n${previousQuestions}\n` : ""}
    ${recentTranscript ? `Recent Transcript:\n${recentTranscript}` : ""}

    Next Interviewer response:
  `;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const response = result.text?.trim();
    if (!response)
      throw new ErrorResponse("AI returned an empty response.", 500);
    return response as string;
  } catch (error) {
    if (error instanceof ErrorResponse) throw error;
    return handleAIError(error);
  }
};

export const evaluateInterview = async (
  transcript: { role: string; text: string }[],
) => {
  const fullTranscript = transcript
    .map((t) => `${t.role === "ai" ? "Interviewer" : "Candidate"}: ${t.text}`)
    .join("\n");

  const prompt = `
    Analyze the following technical interview transcript and provide a structured evaluation.
    You MUST respond with ONLY valid JSON. Do not include markdown formatting like \`\`\`json. Do not include any explanations.
    
    Format your response EXACTLY like this JSON structure:
    {
      "score": 85,
      "feedback": "Overall summary of performance",
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
      "improvements": ["Actionable advice 1", "Actionable advice 2"]
    }

    Transcript:
    ${fullTranscript}
  `;

  let text = "";
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    text = result.text || "";
    if (!text) throw new ErrorResponse("AI returned an empty response.", 500);
  } catch (error) {
    if (error instanceof ErrorResponse) throw error;
    handleAIError(error);
  }

  try {
    // Clean potential markdown or extra characters
    const jsonStr = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("AI failed to generate valid evaluation JSON");
    }

    return JSON.parse(jsonStr.substring(start, end + 1));
  } catch (error) {
    console.error("Failed to parse AI evaluation JSON:", error);
    // Fallback evaluation object
    return {
      score: 50,
      feedback:
        "The interview was too short or the AI failed to generate a complete evaluation.",
      strengths: ["Participated in the interview"],
      weaknesses: ["Insufficient data for a detailed analysis"],
      improvements: [
        "Provide more detailed answers in future sessions to allow for better AI analysis",
      ],
    };
  }
};
