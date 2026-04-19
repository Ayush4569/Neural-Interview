"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFinalInterviewScore = exports.generateInterviewConfig = exports.mintVapiWebToken = exports.assistantLockHash = exports.canonicalizeAssistant = exports.hashPassword = void 0;
exports.normalizeTechStack = normalizeTechStack;
const bcrypt_1 = __importDefault(require("bcrypt"));
const gemini_service_1 = require("../service/gemini.service");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Focus on core nodejs principles
const hashPassword = async (password) => await bcrypt_1.default.hash(password, 10);
exports.hashPassword = hashPassword;
function normalizeTechStack(input) {
    return input
        .replace(/,/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .map(stack => stack.trim())
        .join(',');
}
const canonicalizeAssistant = (assitantConfig) => {
    return JSON.stringify(assitantConfig, Object.keys(assitantConfig).sort());
};
exports.canonicalizeAssistant = canonicalizeAssistant;
const assistantLockHash = (input) => {
    return crypto_1.default.createHash("sha256").update(input).digest("hex");
};
exports.assistantLockHash = assistantLockHash;
const mintVapiWebToken = (interviewId, userId, ttLs = 600, assistantLockHash, jti) => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        jti,
        sub: `user:${userId}`,
        interviewId,
        maxUses: 1,
        aud: "web",
        iat: now,
        exp: now + ttLs,
        orgId: process.env.VAPI_ORG_ID,
        assistantLockHash,
        token: { tag: 'public' }
    };
    return jsonwebtoken_1.default.sign(payload, process.env.VAPI_KEY, { algorithm: "HS256" });
};
exports.mintVapiWebToken = mintVapiWebToken;
const generateInterviewConfig = (interview, userId) => {
    return {
        assistant: {
            name: `Interview Assistant`,
            model: {
                provider: 'openai',
                model: 'gpt-4',
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
            // silenceTimeoutSeconds: 30,
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
        },
        variableValues: {
            interviewId: interview.id,
            userId,
            serverNonce: crypto_1.default.randomUUID(),
            assistantLock: ""
        }
    };
};
exports.generateInterviewConfig = generateInterviewConfig;
const calculateFinalInterviewScore = async (summary) => {
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
        const response = await gemini_service_1.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        if (!response || !response.text) {
            return null;
        }
        return parseInt(response.text);
    }
    catch (error) {
        console.log('Error generating score', error);
        return null;
    }
};
exports.calculateFinalInterviewScore = calculateFinalInterviewScore;
