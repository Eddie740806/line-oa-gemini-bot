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

const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

//=================================================================
// 3. 知識庫 (Knowledge Base) - 擴充版
//=================================================================
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
      '所有老師皆具備 TESOL/TEFL 專業教學證照，並通過嚴格審核。',
      '家長可自由選擇老師，並查看老師自我介紹影片與評價。'
    ]
  },
  {
    heading: '費用與方案 (僅供參考，以顧問報價為準)',
    details: [
      '平均單堂費用：約 NT$380 - NT$450 (視方案與優惠而定)。',
      '升級包：約 NT$62,400 (適合短期衝刺)。',
      '勤學包：約 NT$91,200 (高CP值推薦)。',
      '小拍檔/大拍檔：適合長期規劃或手足共用 (雙寶方案)。',
      '付款方式：支援信用卡分期 (6/12/24期)、轉帳、無卡分期。',
      '退費機制：未滿30天且使用少於一定堂數可退費 (依合約規定)，超過1/3堂數不予退費。'
    ]
  },
  {
    heading: '免費體驗課流程',
    details: [
      '1. 填寫資料：留下稱呼、電話、方便聯絡時段。',
      '2. 顧問諮詢：專業顧問會在您方便的時段致電，了解孩子程度與個性。',
      '3. 安排課程：依需求安排最適合的「雙語」或「外師」體驗課。',
      '4. 設備準備：使用電腦或平板 (需下載 OiKID App) 上課。',
      '5. 正式體驗：25分鐘一對一互動教學，課後提供能力分析報告。'
    ]
  }
];

function buildKnowledgeContext() {
  return knowledgeBase
    .map(
      (section) =>
        `【${section.heading}】\n${section.details.map((item) => `- ${item}`).join('\n')}`
    )
    .join('\n\n');
}
const knowledgeContext = buildKnowledgeContext();

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
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const userId = event.source.userId;
  const sourceType = event.source.type; // 'user', 'group', or 'room'
  const userText = event.message.text.trim();
  const replyToken = event.replyToken;

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
        thumbnailImageUrl: 'https://www.oikid.com/images/og-image.jpg', // 使用官網 OG Image 確保穩定
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
function getVideoFlexMessage() {
  return {
    type: 'flex',
    altText: 'OiKID 上課實況影片',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: 'https://www.oikid.com/images/og-image.jpg', // 改用官網圖片
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
        action: {
          type: 'uri',
          uri: 'https://www.youtube.com/@OiKID' // 改連到官方頻道首頁
        }
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'OiKID 上課實況',
            weight: 'bold',
            size: 'xl'
          },
          {
            type: 'text',
            text: '點擊下方按鈕，前往我們的官方 YouTube 頻道，觀看更多小朋友開心上課的精彩片段！✨',
            margin: 'md',
            size: 'sm',
            color: '#666666',
            wrap: true
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '前往觀看影片',
              uri: 'https://www.youtube.com/@OiKID'
            },
            color: '#FF9900'
          },
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'message',
              label: '我要預約體驗',
              text: '我要預約'
            }
          }
        ],
        flex: 0
      }
    }
  };
}

//=================================================================
// 8. AI 系統提示 (Casey Persona)
//=================================================================
function buildSystemPrompt() {
  return [
    '**角色設定**: 你是 Casey (凱西)，OiKID 的資深教育顧問。你也是一位有兩個孩子的媽媽，非常了解家長對孩子學英文的焦慮。',
    '**核心性格**: 溫暖、有同理心、專業但不嚴肅、像朋友一樣聊天。',
    '**說話風格**:',
    '1. **口語化**: 多用「喔、呢、呀、吧」等語助詞，不要像機器人一樣冷冰冰。',
    '2. **同理心優先**: 回答問題前，先同理家長的感受。例如：「我懂您的擔心，小朋友剛開始接觸外師真的會比較害羞...」',
    '3. **表情符號**: 適度使用 😊, 🌱, ✨, 💪 來增加溫度。',
    '4. **引導行動**: 回答完後，用輕鬆的方式邀請體驗。',
    '',
    '**重要規則**:',
    '- **絕對不要**提供任何「預約連結」或「點擊這裡」之類的文字。',
    '- 當家長想預約體驗課時，請引導他們直接在對話中輸入「我要預約」，系統會自動收集聯絡資訊。',
    '- 例如：「想讓孩子試試看嗎？直接跟我說『我要預約』，我會幫您安排喔！」',
    '',
    '**知識庫**:',
    knowledgeContext,
    '',
    '**任務目標**: 回答家長問題，並讓他們覺得「被理解」，最後願意讓孩子試試看免費體驗課。',
    '**限制**: 回覆長度不要太長，適合手機閱讀。繁體中文回答。'
  ].join('\n');
}

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
