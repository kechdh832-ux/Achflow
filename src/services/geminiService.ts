import { GoogleGenAI } from "@google/genai";
import { Video } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getRecommendedVideos(userInterests: string[], allVideos: Video[]): Promise<Video[]> {
  if (!process.env.GEMINI_API_KEY) {
    return allVideos.slice(0, 5); // Fallback
  }

  try {
    const videoData = allVideos.map(v => ({
      id: v.id,
      title: v.title,
      tags: v.tags,
      description: v.description
    }));

    const prompt = `Given the user interests: ${userInterests.join(", ")}, 
    and the following list of videos: ${JSON.stringify(videoData)},
    recommend the top 5 video IDs that the user would be most interested in.
    Return ONLY a JSON array of strings (the IDs).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const recommendedIds = JSON.parse(response.text || "[]") as string[];
    return allVideos.filter(v => recommendedIds.includes(v.id));
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return allVideos.slice(0, 5);
  }
}

export async function moderateContent(title: string, description: string): Promise<{ safe: boolean; reason?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return { safe: true };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following video title and description for prohibited content. 
      Prohibited content includes: extreme violence, gore, bloody scenes, unethical behavior, sexual content, or hate speech.
      
      Title: ${title}
      Description: ${description}
      
      Respond ONLY with a JSON object: {"safe": boolean, "reason": "string if unsafe"}`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || '{"safe": true}');
    return result;
  } catch (error) {
    console.error("Moderation error:", error);
    return { safe: true };
  }
}
