import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analyzeProgressPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      res.status(400).json({ error: 'base64Image is required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured in backend' });
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this progress photo for a gym member. Provide a brief, encouraging assessment of their posture, visible muscle tone, and overall physique. Keep the response to 3-4 short sentences and be highly motivating. Format with some emojis.`;

    const imageParts = [
      {
        inlineData: {
          data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: 'image/jpeg'
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    res.json({ analysis: text });
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error analyzing photo' });
  }
};
