require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
    getWelcomeFlexMessage,
    getAgeSelectionFlexMessage,
    getPersonalitySelectionFlexMessage,
    getRecommendationFlexMessage
} = require('./src/logic');

// Helper to extract readable text from Flex Message JSON
function extractTextFromFlex(flex) {
    let texts = [];
    const traverse = (node) => {
        if (!node) return;
        if (node.type === 'text' && node.text) {
            texts.push(node.text);
        }
        if (node.contents && Array.isArray(node.contents)) {
            node.contents.forEach(traverse);
        } else if (node.body) traverse(node.body);
        else if (node.footer) traverse(node.footer);
        else if (node.header) traverse(node.header);
        else if (node.hero) traverse(node.hero);
    };
    traverse(flex.contents);
    return texts.join('\n');
}

async function verifyFlow() {
    console.log("🔍 Starting Flow Verification Audit...\n");

    // 1. Simulate the Conversation Flow
    const step1_welcome = extractTextFromFlex(getWelcomeFlexMessage());
    const step2_age = extractTextFromFlex(getAgeSelectionFlexMessage());
    const step3_personality = extractTextFromFlex(getPersonalitySelectionFlexMessage());
    const step4_recommendation = extractTextFromFlex(getRecommendationFlexMessage('個性：害羞'));

    const transcript = `
  [System]: User adds the bot (Follow Event)
  [Bot (Casey)]: 
  ${step1_welcome}
  
  [User]: Clicks "開始免費評測"
  [Bot]: 
  ${step2_age}
  
  [User]: Clicks "3-6歲"
  [Bot]: 
  ${step3_personality}
  
  [User]: Clicks "害羞"
  [Bot]: 
  ${step4_recommendation}
  `;

    console.log("--- Simulated Transcript ---");
    console.log(transcript);
    console.log("----------------------------\n");

    // 2. Ask Gemini to Judge
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
  You are an expert Copywriter and Sales Psychologist. 
  Review the following chatbot interaction flow designed to reactivate dormant leads for an online English school for kids (OiKID).
  
  The Persona is "Casey", a warm, empathetic mom and consultant.
  
  Transcript:
  ${transcript}
  
  Evaluate this flow on two criteria:
  1. **Human Warmth (0-10)**: Does it sound like a real, caring person or a robot? Does it use empathy?
  2. **Guidance/Persuasion (0-10)**: Does it effectively guide the user to the next step without being pushy? Is the "Call to Action" clear?
  
  Provide a brief analysis for each score in Traditional Chinese.
  `;

    try {
        const result = await model.generateContent(prompt);
        console.log("🤖 AI Auditor Evaluation:");
        console.log(result.response.text());
    } catch (error) {
        console.error("Evaluation failed:", error);
    }
}

verifyFlow();
