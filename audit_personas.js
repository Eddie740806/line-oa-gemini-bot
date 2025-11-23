require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
    buildSystemPrompt,
    getWelcomeFlexMessage,
    getCourseIntroFlexMessage,
    getRecommendationFlexMessage
} = require('./src/logic');

// Helper to extract text from Flex Messages for the AI to understand
function extractTextFromFlex(flex) {
    return JSON.stringify(flex, null, 2);
}

async function auditPersonas() {
    console.log("👥 Starting 10-Persona Audit...\n");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = buildSystemPrompt();
    const welcomeMsg = extractTextFromFlex(getWelcomeFlexMessage());
    const introMsg = extractTextFromFlex(getCourseIntroFlexMessage());
    const recMsg = extractTextFromFlex(getRecommendationFlexMessage('個性：害羞'));

    const auditPrompt = `
  You are a Senior UX Researcher and Content Strategist.
  We are auditing a LINE Chatbot for "OiKID" (Online English for Kids).
  
  **Bot Persona**: Casey (Warm, empathetic mom/consultant).
  **System Prompt**:
  ${systemPrompt}

  **Key Visual Assets (Flex Messages)**:
  1. **Welcome Message**: ${welcomeMsg}
  2. **Course Intro (Teachers/Curriculum)**: ${introMsg}
  3. **Recommendation**: ${recMsg}

  **Task**:
  Simulate 10 distinct parent personas interacting with this bot. 
  For each persona, provide:
  1. **Persona Name & Trait** (e.g., "Anxious Mom", "Skeptical Dad").
  2. **Simulated Interaction Summary**: Briefly describe how they interact and how the bot responds based on its logic.
  3. **Pain Point/Gap**: What might this specific parent find missing or frustrating?
  4. **Optimization Suggestion**: One concrete change to improve their experience.

  **Personas to Cover**:
  1. **焦慮新手媽** (怕輸在起跑點, 3歲)
  2. **忙碌工程師爸** (講求效率, 數據導向)
  3. **精打細算媽** (CP值, 價格敏感)
  4. **懷疑論者** (覺得線上沒用, 負面經驗)
  5. **雙語家庭** (高標準, 重視口音)
  6. **放任型家長** (快樂就好, 怕壓力)
  7. **升學導向媽** (為了考試, 國小高年級)
  8. **隔代教養** (阿嬤, 不懂3C)
  9. **曾經失敗過** (孩子排斥英文)
  10. **猶豫不決者** (只問不買, 需要推力)

  Output the result in Traditional Chinese, structured clearly.
  `;

    try {
        const result = await model.generateContent(auditPrompt);
        console.log(result.response.text());
    } catch (error) {
        console.error("Audit failed:", error);
    }
}

auditPersonas();
