require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function generateCases() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    請生成 100 個 LINE 機器人測試案例，用於測試 "OiKID 兒童英文線上學習" 的客服機器人。
    
    格式必須是 JSON Array，每個物件包含：
    - id: 序號 (1-100)
    - type: "1-on-1" (私訊) 或 "group_mention" (群組@提及)
    - persona: 用戶角色 (例如：焦慮媽媽、價格敏感爸爸、阿公阿嬤、忙碌上班族、懷疑論者...)
    - input: 用戶輸入的文字 (要包含各種語氣、口語、錯字、長短句)
    - expected_intent: 預期的意圖 (例如：詢問價格、詢問師資、預約體驗、抱怨...)

    要求：
    1. 案例要非常多樣化，包含刁鑽問題。
    2. "group_mention" 的 input 必須包含 "@OiKID" 或 "@機器人"。
    3. 包含一些非目標客群的問題 (例如：你們有賣教材嗎？)。
    4. 包含一些情緒化的問題 (例如：小孩學很久都沒效)。
    5. 包含直接想預約的訊號。
    
    請直接回傳 JSON 字串，不要有 markdown 標記。
  `;

    console.log('Generating 100 test cases...');
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        fs.writeFileSync('test_cases_100.json', text);
        console.log('Successfully saved test_cases_100.json');
    } catch (error) {
        console.error('Error generating cases:', error);
    }
}

generateCases();
