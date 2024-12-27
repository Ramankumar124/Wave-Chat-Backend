const express = require('express')


const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


module.exports.gemmniChat = async (req, res) => {
    const prompt = req.body.prompt;

    const result = await model.generateContent(prompt);
    res.status(200).json({ response: result.response });
    // console.log(result.response.text());
}