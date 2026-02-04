import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, ImageCategory } from "../types";

export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- GATE EXAM SERVICE ---

export interface GateQuestion {
  id: number;
  type: 'MCQ' | 'MSQ' | 'NAT';
  questionText: string;
  options?: string[]; // Only for MCQ/MSQ
  correctAnswer: string | string[]; // "A" or ["A","B"] or "10.5-12.0"
  marks: number;
  explanation: string;
  gateTrap: string;
}

export const generateGatePaper = async (
  branch: string,
  topic: string,
  mode: 'TOPIC' | 'FULL'
): Promise<GateQuestion[]> => {
  const ai = getClient();
  
  // Prompt Construction based on user request
  let systemContext = `Role: Act as a Senior IIT Professor and GATE Subject Matter Expert for ${branch}. 
  Task: Generate a highly realistic GATE-style practice quiz based on the last 10 years of GATE patterns.`;

  let userPrompt = "";
  
  if (mode === 'TOPIC') {
    userPrompt = `Topic: ${topic}.
    Structure: Provide exactly 5 questions:
    - 2 MCQs (1-mark & 2-mark mix) with 4 options.
    - 1 MSQ (Multiple Select) where one or more options are correct.
    - 2 NAT (Numerical Answer Type) questions requiring specific values.
    
    Constraint: Ensure NAT questions involve multi-step calculations.
    Output: A JSON array of question objects. Do NOT output markdown code blocks, just the raw JSON.`;
  } else {
    // Attempting a larger set for Mock
    userPrompt = `Generate a GATE Mock Paper Section for ${branch}.
    Include a mix of General Aptitude (GA) and Technical questions.
    Total Questions: 15 (Compressed Mock for Latency).
    Distribution: 3 GA, 12 Technical.
    Mix of 1-mark and 2-mark questions.
    Types: MCQ, MSQ, NAT.
    Output: A JSON array of question objects.`;
  }

  const schemaInstruction = `
  Return a JSON array where each object has:
  - id: number
  - type: "MCQ" | "MSQ" | "NAT"
  - questionText: string (use LaTeX syntax like $x^2$ for math if needed)
  - options: array of strings (null for NAT)
  - correctAnswer: string (for MCQ "A", for MSQ "A,B", for NAT "10.5-10.7")
  - marks: number (1 or 2)
  - explanation: string (detailed step-by-step)
  - gateTrap: string (why students fail this question)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // High context, good reasoning
      contents: { parts: [{ text: systemContext + "\n" + userPrompt + "\n" + schemaInstruction }] },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No exam generated.");
    
    const questions = JSON.parse(text.replace(/```json|```/g, '').trim());
    return questions as GateQuestion[];
  } catch (error) {
    console.error("GATE Generation Error:", error);
    throw error;
  }
};

// --- Core Smart Analysis ---

export const detectImageCategory = async (file: File, prompt: string): Promise<AnalysisResult> => {
  const ai = getClient();
  try {
    const imagePart = await fileToGenerativePart(file);
    
    // Using gemini-3-flash-preview for fast multimodal analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Good for vision analysis
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    
    // Cleanup markdown if present to ensure JSON.parse works
    const cleanedText = text.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleanedText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    // Fallback if JSON parsing fails or model errors
    return {
      category: 'UNKNOWN',
      title: 'Analysis Failed',
      description: "Could not auto-detect details. Please try again or use tools manually.",
      attributes: [],
      confidence: 0
    };
  }
};

// --- Specialized Image Tools ---

export const analyzeImageContent = async (
  prompt: string,
  imageFile: File
): Promise<string> => {
  const ai = getClient();
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [imagePart, { text: prompt }]
      }
    });
    return response.text || "No result generated.";
  } catch (error) {
    console.error("Content Analysis Error:", error);
    throw error;
  }
};

export const generateImageTool = async (
  modelName: string, 
  prompt: string,
  imageFile?: File
): Promise<string[]> => {
  const ai = getClient();
  try {
    const parts: any[] = [{ text: prompt }];
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
    });

    const generatedImages: string[] = [];
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }
    }
    
    if (generatedImages.length === 0 && response.text) {
       // Sometimes it might refuse and return text
       console.warn("Model returned text:", response.text);
    }
    return generatedImages;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

// --- Document Tools ---

export const processDocumentText = async (
  prompt: string,
  textInput: string
): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Best for heavy text lifting
      contents: { parts: [{ text: prompt + "\n\nTEXT TO PROCESS:\n" + textInput }] }
    });
    return response.text || "Processing failed.";
  } catch (error) {
    console.error("Doc Processing Error:", error);
    throw error;
  }
};

// --- Presentation Generation (PPT) ---
export interface Slide {
  title: string;
  content: string[];
  speakerNotes: string;
}

export const generatePresentation = async (prompt: string, topic: string): Promise<Slide[]> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt + topic }] },
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "[]";
    // Strip markdown if exists
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr) as Slide[];
  } catch (error) {
    console.error("PPT Generation Error:", error);
    throw error;
  }
};

// --- Video & Audio Tools ---

export const analyzeVideo = async (
  prompt: string,
  videoFile: File
): Promise<string> => {
  const ai = getClient();
  try {
    const videoPart = await fileToGenerativePart(videoFile);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [ videoPart, { text: prompt } ]
      }
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Video Analysis Error:", error);
    throw error;
  }
};

export const generateVeoVideo = async (
  prompt: string,
  imageFile?: File,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  // Ensure we have a fresh client instance to pick up any key changes
  let ai = getClient();

  // Helper to handle the API call with potential key selection retry
  const performGeneration = async (retry = false): Promise<string> => {
    // Check auth for Veo
    if (window.aistudio) {
        // If we are retrying, force open the key selector
        if (retry) {
            await window.aistudio.openSelectKey();
            // Re-instantiate client after key selection to ensure it uses the new key context
            ai = getClient(); 
        } else {
            // Initial check to ensure SOME key is selected
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
                ai = getClient();
            }
        }
    }

    let request: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio }
    };

    if (imageFile) {
       const imagePart = await fileToGenerativePart(imageFile);
       request.image = {
         imageBytes: imagePart.inlineData.data,
         mimeType: imagePart.inlineData.mimeType
       };
    }

    try {
      let operation = await ai.models.generateVideos(request);
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) throw new Error("Video generation failed: No URI returned.");
      
      // Return the URI with the LATEST key from environment
      return `${videoUri}&key=${process.env.API_KEY}`;
      
    } catch (error: any) {
      // 404 "Requested entity was not found" usually means the project/key doesn't have Veo access.
      // We must prompt the user to select a valid paid key.
      const isEntityNotFound = error.message?.includes('Requested entity was not found') || error.toString().includes('Requested entity was not found') || error.status === 404;
      
      if (!retry && isEntityNotFound) {
          console.warn("API Key issue detected (Veo Not Found). Prompting user to select paid key...");
          return await performGeneration(true);
      }
      throw error;
    }
  };

  try {
    return await performGeneration();
  } catch (error) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

// --- Audio Utilities ---

export const playRawAudio = async (base64String: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    try {
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (decodeError) {
       console.log("Standard decode failed, trying raw PCM decode...");
       const dataInt16 = new Int16Array(bytes.buffer);
       const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
       const channelData = buffer.getChannelData(0);
       for (let i = 0; i < dataInt16.length; i++) {
         channelData[i] = dataInt16[i] / 32768.0;
       }
       const source = audioContext.createBufferSource();
       source.buffer = buffer;
       source.connect(audioContext.destination);
       source.start(0);
    }

  } catch (error) {
    console.error("Audio Playback Error:", error);
  }
};