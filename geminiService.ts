
import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, Question, QuestionFormat } from "./types";

export const generateQuizQuestions = async (config: QuizConfig): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const prompt = `
    Generate a professional quiz for the following parameters:
    - Exam Type: ${config.type}
    - Exam Name: ${config.name}
    - Subject/Description: ${config.description}
    - Questions Needed: ${JSON.stringify(config.distribution)}

    Please ensure the questions are challenging and relevant to the level of a ${config.type}.
    For Audio based questions, provide a descriptive 'audioPrompt' that an AI voice would read out.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, description: "One of: MCQ, MSQ, Written, Audio based" },
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Only for MCQ and MSQ types"
            },
            correctAnswer: { 
              type: Type.STRING, 
              description: "The correct answer or answers for MSQ"
            },
            audioPrompt: { 
              type: Type.STRING, 
              description: "Text to be spoken for audio-based questions"
            }
          },
          required: ["id", "type", "question"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse quiz response", error);
    throw new Error("Failed to generate valid quiz content");
  }
};
