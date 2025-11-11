require('dotenv').config();

const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
  throw new Error('Missing LINE channel credentials. Please set LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET.');
}

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('Missing Gemini API key. Please set GEMINI_API_KEY.');
}

const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const systemInstruction = process.env.GEMINI_SYSTEM_PROMPT || 'You are OiKID 24h support assistant.';

const client = new Client(lineConfig);
const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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

const genAI = new GoogleGenerativeAI(geminiApiKey);
global.fetch = global.fetch || fetch;

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

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const replyToken = event.replyToken;
  if (
    replyToken === '00000000000000000000000000000000' ||
    replyToken === 'ffffffffffffffffffffffffffffffff'
  ) {
    // LINE 用於 verify/ping 的測試事件，僅需回傳 200 不須回覆訊息
    return;
  }

  const userText = event.message.text.trim();

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
    text: replyText,
  });
}

function buildSystemPrompt() {
  const formattingGuidelines = [
    '請以溫暖、親切的語氣協助使用者，適度使用貼切的 emoji。',
    '將不同主題拆成段落，段落與段落之間留空行。',
    '段落可加入「【標題】」或 emoji 作為開頭，幫助快速理解。',
    '詳細資訊以列點呈現，列點統一使用「• 」開頭，每點 1 至 2 句。',
    '最後提供下一步行動建議或聯絡方式，並邀請使用者持續提問。'
  ].join('\n');

  return [
    systemInstruction,
    '',
    '以下是客服人員必備的參考資料，回覆時請根據內容提供精準、同理的答案：',
    knowledgeContext,
    '',
    '回覆格式要求：',
    formattingGuidelines,
  ].join('\n');
}

function formatReplyText(rawText) {
  if (!rawText) {
    return '';
  }

  let formatted = rawText.trim().replace(/\r\n/g, '\n');

  // Normalize excessive blank lines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Ensure headings like 【標題】 start on new lines
  formatted = formatted.replace(/(?!^)(【[^】]+】)/g, '\n\n$1');

  // Convert common bullet styles to unified bullet
  formatted = formatted.replace(/^\s*[-*]\s+/gm, '• ');
  formatted = formatted.replace(/^\s*•\s*/gm, '• ');

  // Insert blank line between bullet blocks and following text
  formatted = formatted.replace(/(• .+)(?=\n(?!\n|•))/g, '$1\n');

  // Add extra spacing for sentences without list markers
  formatted = formatted.replace(/([^.\n])\n(?!\n|•|【)/g, '$1\n\n');

  return formatted.trim();
}

async function callGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: geminiModel,
      systemInstruction: buildSystemPrompt(),
    });

    const history = [
      {
        role: 'user',
        parts: [{ text: `客戶提問：${prompt}` }],
      },
    ];

    const result = await model.generateContent({
      contents: history,
    });

    const response = await result.response;
    const text = response.text();

    if (text) {
      const formatted = formatReplyText(text);
      if (formatted) {
        return formatted;
      }
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE bot server is running on port ${port}`);
});


