const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const DEFAULT_INSTRUCTION = `You are RecruiterOps, the ultimate Operations Accelerator for high-growth recruiters. 
Your goal is to increase placement velocity by removing administrative friction.
You excel at:
1. Detecting stalled candidates (those without activity for 48+ hours).
2. Drafting high-conversion follow-up messages for clients and candidates.
3. Coordinating complex interview schedules across time zones.
4. Summarizing daily pipeline health with actionable 'Next Steps'.

Your tone is professional, urgent, and operations-focused. You do not source, vet, or score candidates; you accelerate the operations for talent already in the pipeline.`;

const groqRequest = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY not configured.');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

export const getDailySummary = async (jobs: any[], candidates: any[]) => {
  if (!import.meta.env.VITE_GROQ_API_KEY) return "AI Summary unavailable.";
  try {
    return await groqRequest(
      DEFAULT_INSTRUCTION,
      `Provide a concise "RecruiterOps Daily Briefing" based on this pipeline:
      JOBS: ${JSON.stringify(jobs.map(j => ({ title: j.title, client: j.client })))}
      CANDIDATES: ${JSON.stringify(candidates.map(c => ({ name: c.name, stage: c.stage, lastActivity: c.lastActivityAt })))}
      Identify:
      - Active roles
      - Interviews scheduled for today
      - Top 3 stalled candidates needing immediate action
      - One suggested next action per job.`
    );
  } catch (error) {
    console.error("Summary Error:", error);
    return "Failed to generate daily summary.";
  }
};

export const detectStalledCandidates = async (candidates: any[]) => {
  if (!import.meta.env.VITE_GROQ_API_KEY) return [];
  try {
    const text = await groqRequest(
      DEFAULT_INSTRUCTION + '\nYou must respond with valid JSON only. No markdown, no explanation.',
      `Analyze these candidates and identify which ones have stalled (no activity in 2+ days or stuck in a stage too long).
      CANDIDATES: ${JSON.stringify(candidates)}
      Return a JSON array. Each item must have: id (string), reason (string), suggestedAction (string).
      Example: [{"id":"123","reason":"No contact in 4 days","suggestedAction":"Send follow-up email"}]`
    );
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
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
  if (!import.meta.env.VITE_GROQ_API_KEY) return null;
  try {
    const text = await groqRequest(
      'You are RecruiterOps Scheduler. Create a professional invite that minimizes friction. Respond with valid JSON only. No markdown.',
      `Coordinate an interview for ${candidateName} for ${jobTitle}. Recruiter: ${recruiterName}.
      Return JSON with: subject (string), description (string), suggestedDuration (number in minutes).`
    );
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) { return null; }
};

export const generateOutreach = async (
  candidateName: string,
  candidateContext: string,
  jobContext: string,
  customInstruction?: string
) => {
  if (!import.meta.env.VITE_GROQ_API_KEY) return "API Key not configured.";
  try {
    return await groqRequest(
      customInstruction || DEFAULT_INSTRUCTION,
      `Draft a high-velocity follow-up/outreach message for ${candidateName}. Job: ${jobContext}. Context: ${candidateContext}.`
    );
  } catch (error) { return "Outreach generation failed."; }
};