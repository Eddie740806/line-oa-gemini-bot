require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const { buildSystemPrompt } = require('./src/logic');

// 載入主程式的 System Prompt (模擬 index.js)
// Logic imported from ./src/logic.js

async function runSimulation() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const botModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: buildSystemPrompt()
    });
    const judgeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let testCases = [];
    try {
        testCases = JSON.parse(fs.readFileSync('test_cases_100.json', 'utf8'));
    } catch (e) {
        console.error('Error reading test cases:', e);
        return;
    }

    console.log(`Loaded ${testCases.length} test cases. Starting simulation...`);

    const results = [];
    let totalScore = 0;

    // 為了避免 Rate Limit，分批執行或簡單延遲
    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        console.log(`Processing Case ${i + 1}/${testCases.length}: [${test.type}] ${test.input.substring(0, 20)}...`);

        // 1. Get Bot Response
        let botResponse = '';
        try {
            // 模擬群組 @ 處理：移除 @ 標記
            const cleanInput = test.input.replace(/@OiKID|@機器人/g, '').trim();
            const result = await botModel.generateContent(cleanInput);
            botResponse = result.response.text().trim();
        } catch (e) {
            botResponse = 'Error: ' + e.message;
        }

        // 2. Judge Response
        const judgePrompt = `
      請評分以下客服機器人的回應。
      
      [用戶問題]: ${test.input}
      [機器人回應]: ${botResponse}
      
      請針對以下三個維度評分 (1-5分)：
      1. Warmth (溫度感): 是否像真人、有同理心、不機械？
      2. Clarity (清晰度): 是否清楚回答了問題？
      3. SalesNudge (銷售引導): 是否有自然地邀請預約體驗？
      
      回傳格式 JSON: { "warmth": 5, "clarity": 5, "sales_nudge": 5, "comment": "簡短評語" }
    `;

        let evaluation = {};
        try {
            const judgeResult = await judgeModel.generateContent(judgePrompt);
            const text = judgeResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            evaluation = JSON.parse(text);
        } catch (e) {
            evaluation = { warmth: 0, clarity: 0, sales_nudge: 0, comment: 'Eval Error' };
        }

        const score = (evaluation.warmth + evaluation.clarity + evaluation.sales_nudge) / 3;
        totalScore += score;

        results.push({
            id: test.id,
            input: test.input,
            response: botResponse,
            evaluation: evaluation,
            score: score
        });

        // 簡單延遲
        await new Promise(r => setTimeout(r, 1000));
    }

    const avgScore = totalScore / testCases.length;
    console.log(`\nSimulation Complete. Average Score: ${avgScore.toFixed(2)}/5.0`);

    fs.writeFileSync('simulation_results.json', JSON.stringify(results, null, 2));

    // 找出低分案例
    const lowScores = results.filter(r => r.score < 4.0);
    console.log(`Found ${lowScores.length} low scoring responses.`);
    if (lowScores.length > 0) {
        console.log('Example Low Score:', lowScores[0]);
    }
}

runSimulation();
