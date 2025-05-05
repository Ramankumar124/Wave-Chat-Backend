import express, { Request, Response } from 'express';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const gemmniChat = async (req: Request, res: Response) => {
    const prompt = req.body.prompt;

    const result = await model.generateContent(prompt);
    res.status(200).json({ response: result.response });
}
export default gemmniChat