//=================================================================
// 【OiKID Line Bot v10.0 - Group Support & Warm Persona】
//=================================================================

require('dotenv').config();

const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 1. LINE 憑證檢查
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
  throw new Error('Missing LINE channel credentials.');
}

// 2. Gemini API 憑證檢查
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error('Missing Gemini API key.');
}

const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const {
  buildSystemPrompt,
  getVideoFlexMessage,
  getWelcomeFlexMessage,
  getAgeSelectionFlexMessage,
  getPersonalitySelectionFlexMessage,
  getRecommendationFlexMessage
} = require('./logic');

//=================================================================
// 3. 知識庫 (Knowledge Base) - 已移至 logic.js
//=================================================================
// Logic imported from ./logic.js

//=================================================================
// 4. 狀態管理 (State Management for Lead Gen)
//=================================================================
const userSessions = new Map();

const STATES = {
  NONE: 'NONE',
  AWAITING_NAME: 'AWAITING_NAME',
  AWAITING_PHONE: 'AWAITING_PHONE',
  AWAITING_TIME: 'AWAITING_TIME'
};

// 儲存名單到 CSV
function saveLeadToCSV(userId, data) {
  const filePath = path.join(__dirname, '../leads.csv');
  const timestamp = new Date().toISOString();
  const newLine = `"${timestamp}","${data.name}","${data.phone}","${data.preferredTime}","NEW"\n`;

  fs.appendFile(filePath, newLine, (err) => {
    if (err) console.error('Error saving lead:', err);
    else console.log(`Lead saved for user ${userId}`);
  });
}

//=================================================================
// 5. 初始化
//=================================================================
const client = new Client(lineConfig);
const genAI = new GoogleGenerativeAI(geminiApiKey);
global.fetch = global.fetch || fetch;
const app = express();

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/webhook', middleware(lineConfig), async (req, res) => {
  const events = Array.isArray(req.body?.events) ? req.body.events : [];
  if (events.length === 0) {
    res.status(200).end();
    return;
  }
  await Promise.all(
    events.map(async (event) => {
      try {
        await handleEvent(event);
      } catch (error) {
        console.error('Error handling event:', error);
      }
    })
  );
  res.status(200).end();
});

//=================================================================
// 6. 核心事件處理器 (handleEvent)
//=================================================================
async function handleEvent(event) {
  // --- 0. 加入好友 (Follow) 事件 ---
  if (event.type === 'follow') {
    await client.replyMessage(event.replyToken, getWelcomeFlexMessage());
    return;
  }

  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const userId = event.source.userId;
  const sourceType = event.source.type; // 'user', 'group', or 'room'
  const userText = event.message.text.trim();
  const replyToken = event.replyToken;

  // --- Re-engagement Flow Triggers ---
  if (userText === '開始免費評測') {
    await client.replyMessage(replyToken, getAgeSelectionFlexMessage());
    return;
  }

  if (userText.startsWith('年齡：')) {
    await client.replyMessage(replyToken, getPersonalitySelectionFlexMessage());
    return;
  }

  if (userText.startsWith('個性：')) {
    await client.replyMessage(replyToken, getRecommendationFlexMessage(userText));
    return;
  }

  if (userText === '觀看上課影片') {
    await client.replyMessage(replyToken, getVideoFlexMessage());
    return;
  }

  if (userText === '我想直接詢問') {
    // Let it fall through to Gemini, but maybe with a specific prompt or state?
    // For now, let Gemini handle it naturally as Casey.
  }

  // --- A. 群組/多人聊天室 邏輯 ---
  if (sourceType === 'group' || sourceType === 'room') {
    // 1. 檢查是否被 @提及
    const mentionees = event.message.mention?.mentionees || [];

    // 如果沒有 mention 物件，代表這只是一般群組訊息 -> 忽略。
    if (mentionees.length === 0) {
      return; // 沒人被 @，忽略
    }

    // 2. 群組內不進行 Lead Gen (隱私保護)
    // 如果使用者在群組問「我要預約」，引導私訊。
    if (userText.includes('預約') || userText.includes('試聽')) {
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '太棒了！為了保護您的隱私 (避免在群組公開電話)，請您直接點擊我的頭像「私訊」我，或由群組內的業務人員為您服務喔！😊'
      });
      return;
    }

    // 3. 群組內的一般 AI 回覆
    // 移除 @ 符號與名字，避免 AI 讀到奇怪的字
    const replyText = await callGemini(userText);
    await client.replyMessage(replyToken, { type: 'text', text: replyText });
    return;
  }

  // --- B. 一對一私訊 (1-on-1) 邏輯 ---

  // 取得或初始化 User Session
  let session = userSessions.get(userId) || { state: STATES.NONE, data: {} };

  // 1. 觸發預約
  if (userText === '立即預約體驗' || userText.includes('我要預約') || userText.includes('試聽')) {
    userSessions.set(userId, { state: STATES.AWAITING_NAME, data: {} });
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '太棒了！給孩子一個愛上英文的機會。🌱\n\n請問怎麼稱呼您呢？(例如：陳媽媽、林先生)'
    });
    return;
  }

  // 2. 接收姓名 -> 問電話
  if (session.state === STATES.AWAITING_NAME) {
    session.data.name = userText;
    session.state = STATES.AWAITING_PHONE;
    userSessions.set(userId, session);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: `好的 ${userText}，為了讓顧問能聯繫您安排時間，請留下您的手機號碼：`
    });
    return;
  }

  // 3. 接收電話 -> 問方便聯絡時段
  if (session.state === STATES.AWAITING_PHONE) {
    if (userText.length < 8 || isNaN(Number(userText.replace(/-/g, '')))) {
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '這似乎不是有效的手機號碼，請重新輸入一次喔：'
      });
      return;
    }
    session.data.phone = userText;
    session.state = STATES.AWAITING_TIME;
    userSessions.set(userId, session);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '收到！最後請問您方便接聽電話的時段是？\n(例如：平日下午、週末早上、晚上8點後都可以)'
    });
    return;
  }

  // 4. 接收方便時段 -> 完成
  if (session.state === STATES.AWAITING_TIME) {
    session.data.preferredTime = userText;
    saveLeadToCSV(userId, session.data);
    userSessions.delete(userId);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: `太好了！我已經收到您的資料：\n\n👤 稱呼：${session.data.name}\n📞 電話：${session.data.phone}\n⏰ 方便時段：${session.data.preferredTime}\n\n我們的專業顧問會盡快在您方便的時段與您聯繫，協助安排最適合的免費體驗課程！✨\n\n期待您的寶貝能在 OiKID 找到學英文的樂趣！如果還有其他問題，隨時都可以問我喔！😊`
    });
    return;
  }

  // 檢測「上課方式」相關問題 → 自動分享影片
  if (
    userText.includes('上課') ||
    userText.includes('怎麼教') ||
    userText.includes('課程內容') ||
    userText.includes('教學方式') ||
    userText.includes('實際上課')
  ) {
    await client.replyMessage(replyToken, getVideoFlexMessage());
    return;
  }

  // --- 一般對話處理 ---

  if (userText === '主選單' || userText.toLowerCase() === 'menu') {
    await client.replyMessage(replyToken, {
      type: 'template',
      altText: 'OiKID 服務選單',
      template: {
        type: 'buttons',
        thumbnailImageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Happy child learning
        imageAspectRatio: 'rectangle',
        imageSize: 'cover',
        title: 'OiKID 英語線上學習',
        text: '歡迎！我是您的專屬顧問 Casey。請問想了解什麼？',
        actions: [
          { type: 'message', label: '立即預約體驗 (免費)', text: '立即預約體驗' },
          { type: 'message', label: '課程與費用說明', text: '課程與費用說明' },
          { type: 'message', label: '師資團隊介紹', text: '師資團隊介紹' },
          { type: 'message', label: '常見問題', text: '常見問題' }
        ]
      }
    });
    return;
  }

  // Fallback: 呼叫 Gemini
  let replyText;
  try {
    replyText = await callGemini(userText);
  } catch (error) {
    console.error('Gemini API error:', error);
    replyText = '抱歉，系統忙線中，請稍後再試。';
  }

  await client.replyMessage(replyToken, {
    type: 'text',
    text: replyText
  });
}

//=================================================================
// 7. Flex Messages
//=================================================================
// getVideoFlexMessage imported from ./logic.js

//=================================================================
// 8. AI 系統提示 (Casey Persona)
//=================================================================
// buildSystemPrompt imported from ./logic.js

//=================================================================
// 8. Gemini API 呼叫
//=================================================================
async function callGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: geminiModel,
      systemInstruction: buildSystemPrompt()
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini Error:', error);
    return '抱歉，我目前無法回答這個問題，建議您直接輸入「我要預約」由專人為您服務。';
  }
}

// 9. 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE bot server is running on port ${port}`);
});
