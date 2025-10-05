import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('⚠️  GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function getRecommendation(prompt) {
  try {
    console.log('🤖 Generating AI recommendation...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // Use latest stable model
      generationConfig: {
        temperature: 0.7, // Balanced creativity and consistency
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ AI recommendation generated successfully');
    return text;
  } catch (error) {
    console.error('❌ AI recommendation error:', error);
    throw error;
  }
}