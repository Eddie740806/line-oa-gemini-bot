require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method on the client instance in some versions, 
        // but usually we can try to generate content or check documentation. 
        // However, the error message suggested "Call ListModels to see the list".
        // The SDK might not expose listModels directly on the main class in all versions.
        // Let's try to use the model and see if we can get a different error or success with a different name.
        // Actually, let's try to just run a simple generation with 'gemini-1.5-flash-001' which is the specific version.

        console.log("Testing gemini-1.5-flash-001...");
        const model001 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model001.generateContent("Hello");
        console.log("gemini-1.5-flash-001 works! Response:", result.response.text());
    } catch (error) {
        console.error("gemini-1.5-flash-001 failed:", error.message);

        try {
            console.log("Testing gemini-pro...");
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello");
            console.log("gemini-pro works! Response:", resultPro.response.text());
        } catch (e) {
            console.error("gemini-pro failed:", e.message);
        }
    }
}

listModels();
