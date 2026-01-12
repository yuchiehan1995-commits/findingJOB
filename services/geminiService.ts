
import { GoogleGenAI, Type } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface JDAnalysisResult {
  skills: string[];
  softSkills: string[];
  strategy: string;
}

export const analyzeJD = async (jdText: string): Promise<JDAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this Job Description and extract key skills and a quick strategy: \n\n${jdText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3-5 core technical skills or domain knowledge required."
          },
          softSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 2-3 essential soft skills."
          },
          strategy: {
            type: Type.STRING,
            description: "A one-sentence high-level strategy for applying to this specific role."
          }
        },
        required: ["skills", "softSkills", "strategy"]
      },
      systemInstruction: "You are an expert career consultant and technical recruiter. Your goal is to help candidates identify the most critical keywords and skills to emphasize in their resume and interview for a given job description."
    }
  });

  // Access the .text property directly to get the extracted string output.
  const text = response.text || "{}";
  try {
    return JSON.parse(text) as JDAnalysisResult;
  } catch (e) {
    console.error("Failed to parse JD analysis response", e);
    return {
      skills: [],
      softSkills: [],
      strategy: "Could not generate strategy at this time."
    };
  }
};
