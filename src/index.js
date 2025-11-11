//=================================================================
// 【請將 src/index.js 的內容完整替換為以下程式碼】
// (版本 v8：無圖片、無體驗課連結)
//=================================================================

require('dotenv').config();

const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const systemInstruction = process.env.GEMINI_SYSTEM_PROMPT || 'You are OiKID 24h support assistant.';

// 3. 知識庫 (Knowledge Base)
const knowledgeBase = [
  {
    heading: '聯絡資訊與服務時間',
    details: [
      '客服電話：0800-010-920',
      '服務時間：週一至週日 09:00–22:00（課程時段 09:00–22:30）',
      '客服信箱：service@oikid.com.tw',
      '合作洽詢：partnership@oikid.com.tw',
      '繳費方式：信用卡、匯款、虛擬帳號'
    ]
  },
  {
    heading: '課程資訊',
    details: [
      '對象：3–15 歲孩童',
      '課程長度：每堂 25 分鐘，一對一直播教學',
      '時間安排：每週一中午 12:00 開放下一週預約',
      '課程類型：一對一精品課程、摩天輪團體課程、主題體驗營',
      '教材：依照美國 CCSS 與台灣 108 課綱分級，共 8 個等級'
    ]
  },
  {
    heading: '師資資訊',
    details: [
      '所有外師具備專業教學證照或幼教背景',
      '主要來自美國、加拿大、英國、澳洲、南非等以英語為母語國家',
      '提供雙語中師協助課後複習與家長溝通'
    ]
  },
  {
    heading: '方案與費用',
    details: [
      '升級包：NT$62,400（124 堂課）',
      '勤學包：NT$91,200（190 堂課）',
      '小拍檔：NT$124,800（266 堂課）',
      '大拍檔：NT$156,000（340 堂課）',
      '提供 6、12、24 期分期付款，舊生續購享專屬優惠'
    ]
  },
  {
    heading: '預約與取消規定',
    details: [
      '課程需提前預約，建議至少 24 小時前安排',
      '課程開始前 24 小時可免費取消，逾時視同上課並扣除堂數',
      '遇系統或老師端因素取消，堂數自動退回'
    ]
  },
  {
    heading: '常見問題與技術支援',
    details: [
      '建議使用最新版本 Chrome 或 Firefox，確保良好體驗',
      '若遇到畫面卡頓，請重新整理或重開電腦／App',
      '課後可於家長專區下載錄影與作業單字卡',
      '行動 App 支援 iOS、Android，需維持網路穩定'
    ]
  },
  {
    heading: '退費機制',
    details: [
      '課程無鑑賞期，購買後若需解約請聯繫客服',
      '30 日內解約：已上堂數以每堂 NT$900 計算扣除，餘額退還',
      '30 日後解約：除已上堂數外，加收合約總金額 30% 手續費',
      '課程進度已超過三分之一，不再受理退費'
    ]
  },
  {
    heading: '家長常見反饋',
    details: [
      '班主任提供學習追蹤與課後提醒',
      '每堂課提供錄影回放與複習教材',
      '定期舉辦勤學排行榜與獎學金活動',
      '家長可透過 LINE 官方帳號、客服電話即時諮詢'
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

// 4. v8 版 - 素材與腳本變數
const caseySalesLink = 'https://preview--learn-abc-playfully.lovable.app/casey';
const classVideoUrl = 'http://www.youtube.com/watch?v=rHEO487EiXA';
const classVideoThumbnailUrl = 'https://img.youtube.com/vi/rHEO487EiXA/hqdefault.jpg';

const ageGroupContent = {
  "3-5歲": `🌱 3-5歲 啟蒙黃金期\n💡 建議從雙語教師開始，降低語言焦慮\n\n建議級別：Level 1, Level 2\n學習重點：\n• 自然發音\n• 基礎單字\n• 遊戲互動\n\n💬 Casey 的貼心提醒：\n這個階段最重要的是「讓孩子喜歡」，不用急著要成效。我建議先用雙語老師建立信心，等孩子敢開口後再轉外師。`,
  "6-8歲": `📚 6-8歲 建立基礎期\n💡 雙軌並行，精品課+摩天輪課擴展視野\n\n建議級別：Level 2, Level 3, Level 4\n學習重點：\n• 句型應用\n• 閱讀理解\n• 日常會話\n\n💬 Casey 的貼心提醒：\n這年紀的孩子開始有學校課業壓力，我會協助您平衡OiKID課程與學校進度，讓孩子學得輕鬆又能應付考試。`,
  "9-12歲": `🚀 9-12歲 能力躍升期\n💡 外師為主，加強口說與思辨能力\n\n建議級別：Level 5, Level 6, Level 7\n學習重點：\n• 流利對話\n• 文章寫作\n• 主題討論\n\n💬 Casey 的貼心提醒：\n高年級孩子需要更多挑戰，我會推薦辯論課、文法課，為國中英文打好基礎，也培養國際觀。`,
  "13-15歲": `🎯 13-15歲 精進專業期\n💡 學術英語與專業主題，培養國際競爭力\n\n建議級別：Level 7, Level 8\n學習重點：\n• 學術寫作\n• 專業簡報\n• 深度辯論\n\n💬 Casey 的貼心提醒：\n國高中階段的孩子需要更專業的訓練，我會協助規劃學測、多益準備課程，同時加強學術英文能力，為未來升學或留學做準備。`
};

// 5. 初始化 LINE / Gemini / Express
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

// 6. v8 版 - 核心事件處理器 (handleEvent)
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const replyToken = event.replyToken;
  if (
    replyToken === '00000000000000000000000000000000' ||
    replyToken === 'ffffffffffffffffffffffffffffffff'
  ) {
    return;
  }

  const userText = event.message.text.trim();
  let replyMsg;

  // --- 1. 處理「你好」或「主選單」 ---
  if (
    userText.includes('你好') ||
    userText.includes('Hello') ||
    userText.toLowerCase() === 'menu' ||
    userText === '主選單'
  ) {
    replyMsg = {
      type: 'template',
      altText: '您好！我是 OiKID 線上客服助理。',
      template: {
        type: 'buttons',
        title: '您好！我是 OiKID 24h 線上客服助理',
        text: '很高興能為您服務，請問您想了解什麼呢？',
        actions: [
          { type: 'message', label: '依年齡選課 (推薦)', text: '依年齡選課' },
          { type: 'message', label: '為什麼選 OiKid？', text: '為什麼選 OiKid' },
          { type: 'message', label: '師資團隊介紹', text: '師資團隊介紹' },
          { type: 'message', label: '觀看上課實況 (影片)', text: '觀看上課實況' }
        ]
      }
    };
    await client.replyMessage(event.replyToken, replyMsg);
    return;
  }

  // --- 2. 處理「依年齡選課」 ---
  if (
    userText === '依年齡選課' ||
    userText.toLowerCase().includes('price') ||
    userText.includes('多少錢')
  ) {
    replyMsg = {
      type: 'text',
      text:
        '好的！OiKid 的課程是為 3-15 歲孩子設計的。\n為了提供您最準確的資訊，請問您孩子的年齡是？',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: '3-5歲 (啟蒙黃金期)',
              text: '我想了解 3-5歲'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '6-8歲 (建立基礎期)',
              text: '我想了解 6-8歲'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '9-12歲 (能力躍升期)',
              text: '我想了解 9-12歲'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '13-15歲 (精進專業期)',
              text: '我想了解 13-15歲'
            }
          }
        ]
      }
    };
    await client.replyMessage(event.replyToken, replyMsg);
    return;
  }

  // --- 3. 處理「我想了解...歲」 ---
  if (userText.startsWith('我想了解 ')) {
    const ageKey = userText.replace('我想了解 ', '').trim();
    const scriptedReply = ageGroupContent[ageKey];

    if (scriptedReply) {
      const msg1 = { type: 'text', text: scriptedReply };
      const msg2 = {
        type: 'text',
        text:
          `想知道 Casey 顧問如何為這年紀的孩子打造專屬學習路徑嗎？\n歡迎查看詳細介紹： ${caseySalesLink}`,
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'message',
                label: '觀看上課實況 (影片)',
                text: '觀看上課實況'
              }
            },
            { type: 'action', action: { type: 'message', label: '師資團隊介紹', text: '師資團隊介紹' } }
          ]
        }
      };
      await client.replyMessage(event.replyToken, [msg1, msg2]);
      return;
    }
  }

  // --- 4. 處理「觀看上課實況」 ---
  if (userText === '觀看上課實況') {
    replyMsg = {
      type: 'video',
      originalContentUrl: classVideoUrl,
      previewImageUrl: classVideoThumbnailUrl
    };
    await client.replyMessage(event.replyToken, replyMsg);
    return;
  }

  // --- 5. 處理「為什麼選 OiKid」 ---
  if (userText === '為什麼選 OiKid') {
    replyMsg = {
      type: 'template',
      altText: '為什麼要選擇 OiKid？',
      template: {
        type: 'buttons',
        title: '為什麼選擇 OiKid？',
        text: '我們有四大核心優勢，您可以點擊下方按鈕，由 AI 助理為您說明：',
        actions: [
          { type: 'message', label: '360° 學習體驗', text: '我想了解 360 學習體驗' },
          { type: 'message', label: '獨家教材特色', text: '我想了解教材特色' },
          { type: 'message', label: '獨家技術加持', text: '我想了解 OiKid 技術' },
          { type: 'message', label: '真實服務成效', text: '我想看家長見證' }
        ]
      }
    };
    await client.replyMessage(event.replyToken, replyMsg);
    return;
  }

  // --- 6. 處理「師資團隊介紹」 ---
  if (userText === '師資團隊介紹') {
    replyMsg = {
      type: 'template',
      altText: 'OiKid 師資團隊介紹',
      template: {
        type: 'buttons',
        title: 'OiKid 師資團隊',
        text: '我們的師資分為「專業外師」與「貼心雙語教師」，您想先了解哪一個？',
        actions: [
          { type: 'message', label: '我想了解外師', text: '我想了解外師' },
          { type: 'message', label: '我想了解雙語中師', text: '我想了解雙語中師' }
        ]
      }
    };
    await client.replyMessage(event.replyToken, replyMsg);
    return;
  }

  // --- Fallback: 呼叫 Gemini
  let replyText;
  try {
    replyText = await callGemini(userText);
  } catch (error) {
    console.error('Gemini API error:', error?.response?.data || error);
    replyText = '抱歉，我現在遇到一些問題，請稍後再試一次。';
  }

  if (!replyText) {
    replyText = '抱歉，我現在沒有適合的回答。';
  }

  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
}

// 7. v8 版 - AI 後援提示 (buildSystemPrompt)
function buildSystemPrompt() {
  const conversationRules = [
    '**【AI 規則】（你是一個 AI 後援，只在腳本無法處理時才會被呼叫）：**',
    '1. 【嚴禁洗版】：你的回覆**必須**精簡在「一個」回覆訊息中。',
    '2. 【只答所問】：你必須**只回答**用戶当前提出的**具體問題**（例如「退費機制」、「如何取消課程」、「我想了解外師」）。',
    '3. 【嚴禁引導】：**絕對禁止**主動提供「您可以試著問我...」之類的引導，因為那是主要腳本的工作。你只需回答問題。'
  ].join('\n');

  const formattingRules = [
    '**【排版規則】（你必須嚴格遵守）：**',
    '1. 【目標介面】：你的回覆將顯示在「手機 LINE」的聊天視窗中。因此**嚴禁回覆任何擠在一起的長篇文字**。',
    '2. 【強制換行】：在回答時，每個句子、每個要點、或段落之間，**必須**使用「換行符」(\n) 進行分隔。',
    '3. 【強制列表化】：當答案包含多個項目時（例如：退費規定、聯絡方式），**絕對必須**使用「項目符號列表」來呈現。',
    '4. 【友善包裝 (極重要)】：**絕對禁止**只回傳生硬的條目！你必須用「友善且完整的句子」來包裝你的答案。',
    '   - **(錯誤 ❌)：**',
    '     • 課程開始前 24 小時可免費取消',
    '     • 逾時視同上課',
    '   - **(正確 ✅)：**',
    '     「您好，關於取消課程的規定如下：',
    '     • 課程開始前 24 小時可免費取消。',
    '     • 若逾時取消，將視同上課並扣除堂數喔。」',
    '5. 【語氣】：保持專業、友善、有同理心。'
  ].join('\n');

  return [
    systemInstruction,
    '',
    conversationRules,
    '',
    formattingRules,
    '',
    '--- 以下是客服人員必備的參考資料 (知識庫) ---',
    knowledgeContext,
    '--- 參考資料結束 ---',
    '',
    '（你現在是 OiKID 客服助理，請嚴格遵守上述所有規則，並根據知識庫資料，回覆客戶的下一個問題）'
  ].join('\n');
}

// 8. v8 版 - AI 核心呼叫 (callGemini)
async function callGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: geminiModel,
      systemInstruction: buildSystemPrompt()
    });

    const history = [
      {
        role: 'user',
        parts: [{ text: `客戶提問：${prompt}` }]
      }
    ];

    const result = await model.generateContent({
      contents: history
    });

    const response = await result.response;
    const text = response.text();

    if (text) {
      return text.trim();
    }
    console.error('Gemini SDK returned empty response.');
    return null;
  } catch (error) {
    console.error('Error calling Gemini SDK:', error);
    if (error?.response?.data) {
      console.error('Gemini API Error Details:', error.response.data);
    }
    return null;
  }
}

// 9. 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE bot server is running on port ${port}`);
});

//=================================================================
// 【程式碼結束】
//=================================================================


