import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DEFAULT_INSTRUCTION = `You are RecruiterOps, the ultimate Operations Accelerator for high-growth recruiters. 
Your goal is to increase placement velocity by removing administrative friction.
You excel at:
1. Detecting stalled candidates (those without activity for 48+ hours).
2. Drafting high-conversion follow-up messages for clients and candidates.
3. Coordinating complex interview schedules across time zones.
4. Summarizing daily pipeline health with actionable 'Next Steps'.

Your tone is professional, urgent, and operations-focused. You do not source, vet, or score candidates; you accelerate the operations for talent already in the pipeline.`;

// ✅ Fixed model name (was 'gemini-3-flash-preview' which doesn't exist)
const MODEL = 'gemini-2.0-flash';

export const getDailySummary = async (jobs: any[], candidates: any[]) => {
  if (!process.env.API_KEY) return "AI Summary unavailable.";
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Provide a concise "RecruiterOps Daily Briefing" based on this pipeline:
      JOBS: ${JSON.stringify(jobs.map(j => ({ title: j.title, client: j.client })))}
      CANDIDATES: ${JSON.stringify(candidates.map(c => ({ name: c.name, stage: c.stage, lastActivity: c.lastActivityAt })))}
      Identify:
      - Active roles
      - Interviews scheduled for today
      - Top 3 stalled candidates needing immediate action
      - One suggested next action per job.`,
      config: { systemInstruction: DEFAULT_INSTRUCTION }
    });
    return response.text;
  } catch (error) {
    console.error("Summary Error:", error);
    return "Failed to generate daily summary.";
  }
};

export const detectStalledCandidates = async (candidates: any[]) => {
  if (!process.env.API_KEY) return [];
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Analyze these candidates and identify which ones have 'stalled' (no activity in 2+ days or stuck in a stage too long). 
      CANDIDATES: ${JSON.stringify(candidates)}
      Return a list of IDs and a brief 'Reason' for each.`,
      config: {
        systemInstruction: DEFAULT_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              reason: { type: Type.STRING },
              suggestedAction: { type: Type.STRING }
            },
            required: ["id", "reason", "suggestedAction"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const coordinateInterview = async (
  candidateName: string,
  candidateEmail: string,
  candidatePhone: string,
  jobTitle: string,
  recruiterName: string
) => {
  if (!process.env.API_KEY) return null;
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Coordinate an interview for ${candidateName} for ${jobTitle}. Assume Recruiter ${recruiterName} is scheduling.`,
      config: {
        systemInstruction: "You are RecruiterOps Scheduler. Create a professional invite that minimizes friction.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedDuration: { type: Type.NUMBER }
          },
          required: ["subject", "description", "suggestedDuration"]
        }
      }
    });
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) { return null; }
};

export const generateOutreach = async (
  candidateName: string,
  candidateContext: string,
  jobContext: string,
  customInstruction?: string
) => {
  if (!process.env.API_KEY) return "API Key not configured.";
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Draft a high-velocity follow-up/outreach for ${candidateName}. Fit: ${jobContext}. Context: ${candidateContext}.`,
      config: { systemInstruction: customInstruction || DEFAULT_INSTRUCTION }
    });
    return response.text;
  } catch (error) { return "Outreach generation failed."; }
};