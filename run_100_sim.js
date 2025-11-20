require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// 載入主程式的 System Prompt (模擬 index.js)
// 為了方便測試，這裡複製 index.js 的邏輯，實際專案中應該模組化
const knowledgeBase = [
    {
        heading: '品牌與課程特色',
        details: [
            'OiKID 是專為 3-15 歲設計的線上英語學習平台。',
            '教材特色：參考美國 CCSS 與台灣 108 課綱，結合遊戲式教學，讓孩子愛上開口說。',
            '課程形式：一對一精品課程 (25分鐘)、摩天輪團體課程 (1對4)、直播課。',
            '學習流程：課前預習 (5-8分鐘影片) -> 課中互動 (25分鐘) -> 課後複習 (錄影回放/作業)。'
        ]
    },
    {
        heading: '師資團隊',
        details: [
            '雙語師：具備幼教背景，適合零基礎或害羞的孩子，協助建立自信。',
            '外籍師：來自美、加、英、澳、南非等母語國家，提供純正口音沉浸環境。',
            '所有老師皆具備 TESOL/TEFL 專業教學證照，並通過嚴格審核。'
        ]
    },
    {
        heading: '費用與方案',
        details: [
            '平均單堂費用：約 NT$380 - NT$450。',
            '升級包：約 NT$62,400。',
            '勤學包：約 NT$91,200。',
            '退費機制：未滿30天且使用少於一定堂數可退費。'
        ]
    }
];

function buildSystemPrompt() {
    return [
        '**角色設定**: 你是 Casey (凱西)，OiKID 的資深教育顧問。你也是一位有兩個孩子的媽媽。',
        '**核心性格**: 溫暖、有同理心、專業但不嚴肅、像朋友一樣聊天。',
        '**說話風格**: 口語化 (喔、呢、呀)、同理心優先、適度表情符號 (😊, 🌱)。',
        '**重要任務**: 回答完問題後，必須用輕鬆的方式邀請體驗 (Call to Action)。',
        '**知識庫**:',
        knowledgeBase.map(s => `【${s.heading}】\n${s.details.map(i => `- ${i}`).join('\n')}`).join('\n\n'),
        '',
        '**限制**: 繁體中文，適合手機閱讀。'
    ].join('\n');
}

async function runSimulation() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const botModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: buildSystemPrompt()
    });
    const judgeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
