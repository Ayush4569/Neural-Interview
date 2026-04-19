import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateInterviewQuestion = async (
  jobTitle: string,
  techStack: string[],
  experienceLevel: string,
  transcript: { role: string; content: string }[],
  isEnding: boolean = false
) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const context = transcript
    .map((t) => `${t.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${t.content}`)
    .join('\n');

  let prompt = `
    You are an expert technical interviewer for the position of ${jobTitle}.
    The candidate has experience with: ${techStack.join(', ')}.
    Their level is ${experienceLevel}.

    Rules:
    - Keep questions concise and professional.
    - Ask ONE question at a time.
    - The interview MUST start with the candidate introducing themselves. Ask specifically for their name and a brief professional background before diving into technical questions.
    - If the user has introducted themselves, proceed to technical evaluation and ask a follow-up or a new question.
    - Do not provide the answer to your own questions unless asked for feedback.
  `;

  if (isEnding) {
    return "Alright it was great but since we dont have much time left its time to conclude, good luck for your future, you will get the evaluation of the interview uptil now.";
  }

  prompt += `
    Transcript so far:
    ${context}

    Next Interviewer response:
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const evaluateInterview = async (transcript: { role: string; content: string }[]) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const fullTranscript = transcript
    .map((t) => `${t.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${t.content}`)
    .join('\n');

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  try {
    const text = response.text();
    // Clean potential markdown or extra characters
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      throw new Error('AI failed to generate valid evaluation JSON');
    }
    
    return JSON.parse(jsonStr.substring(start, end + 1));
  } catch (error) {
    console.error('Failed to parse AI evaluation JSON:', error);
    // Fallback evaluation object
    return {
      score: 50,
      feedback: "The interview was too short or the AI failed to generate a complete evaluation.",
      strengths: ["Participated in the interview"],
      weaknesses: ["Insufficient data for a detailed analysis"],
      improvements: ["Provide more detailed answers in future sessions to allow for better AI analysis"]
    };
  }
};
