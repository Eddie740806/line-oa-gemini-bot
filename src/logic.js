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

function getVideoFlexMessage() {
    return {
        type: 'flex',
        altText: 'OiKID 上課實況影片',
        contents: {
            type: 'bubble',
            hero: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Happy child learning
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

function getWelcomeFlexMessage() {
    return {
        type: 'flex',
        altText: '歡迎來到 OiKID！🌱',
        contents: {
            type: 'bubble',
            hero: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Happy child learning
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
                action: {
                    type: 'uri',
                    uri: 'https://www.oikid.com'
                }
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: 'Hi 媽咪/爸比，我是 Casey！👋',
                        weight: 'bold',
                        size: 'lg'
                    },
                    {
                        type: 'text',
                        text: '很高興認識您！每個孩子都是獨一無二的，為了給您最適合的建議，我想先了解一下寶貝的狀況。😊',
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
                            type: 'message',
                            label: '🎯 開始免費評測 (推薦)',
                            text: '開始免費評測'
                        },
                        color: '#FF9900'
                    },
                    {
                        type: 'button',
                        style: 'secondary',
                        height: 'sm',
                        action: {
                            type: 'message',
                            label: '📺 觀看上課影片',
                            text: '觀看上課影片'
                        }
                    },
                    {
                        type: 'button',
                        style: 'link',
                        height: 'sm',
                        action: {
                            type: 'message',
                            label: '直接找 Casey 聊聊',
                            text: '我想直接詢問'
                        }
                    }
                ],
                flex: 0
            }
        }
    };
}

function getAgeSelectionFlexMessage() {
    return {
        type: 'flex',
        altText: '請問寶貝幾歲呢？',
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: 'Q1. 請問寶貝今年幾歲呢？👶',
                        weight: 'bold',
                        size: 'lg'
                    },
                    {
                        type: 'text',
                        text: '不同年齡層有不同的學習重點喔！',
                        size: 'xs',
                        color: '#aaaaaa',
                        margin: 'sm'
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
                        style: 'secondary',
                        action: {
                            type: 'message',
                            label: '3 - 6 歲 (學齡前)',
                            text: '年齡：3-6歲'
                        }
                    },
                    {
                        type: 'button',
                        style: 'secondary',
                        action: {
                            type: 'message',
                            label: '7 - 12 歲 (國小)',
                            text: '年齡：7-12歲'
                        }
                    },
                    {
                        type: 'button',
                        style: 'secondary',
                        action: {
                            type: 'message',
                            label: '13 歲以上 (國中)',
                            text: '年齡：13歲以上'
                        }
                    }
                ]
            }
        }
    };
}

function getPersonalitySelectionFlexMessage() {
    return {
        type: 'flex',
        altText: '寶貝的個性是？',
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: 'Q2. 寶貝面對陌生人的個性是？🤔',
                        weight: 'bold',
                        size: 'lg'
                    },
                    {
                        type: 'text',
                        text: '這會幫助我們安排最適合的老師！',
                        size: 'xs',
                        color: '#aaaaaa',
                        margin: 'sm'
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
                        style: 'secondary',
                        action: {
                            type: 'message',
                            label: '害羞 / 需要暖身 🐢',
                            text: '個性：害羞'
                        }
                    },
                    {
                        type: 'button',
                        style: 'secondary',
                        action: {
                            type: 'message',
                            label: '活潑 / 愛講話 🐰',
                            text: '個性：活潑'
                        }
                    }
                ]
            }
        }
    };
}

function getRecommendationFlexMessage(personality) {
    const isShy = personality.includes('害羞');
    const title = isShy ? '推薦：親切雙語老師 🛡️' : '推薦：熱情外籍老師 🌍';
    const desc = isShy
        ? '針對比較害羞的孩子，我們推薦具備幼教背景的「雙語老師」，能用中文輔助引導，讓孩子更有安全感，建立自信開口說！💪'
        : '針對活潑的孩子，我們推薦肢體語言豐富的「外籍老師」，能提供全美語的沉浸式環境，讓孩子盡情發揮，學得更快！🚀';

    return {
        type: 'flex',
        altText: '為您推薦的課程',
        contents: {
            type: 'bubble',
            header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: '✨ 評測結果 ✨',
                        color: '#ffffff',
                        weight: 'bold'
                    }
                ],
                backgroundColor: '#FF9900',
                paddingAll: 'md'
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: title,
                        weight: 'bold',
                        size: 'xl',
                        wrap: true
                    },
                    {
                        type: 'text',
                        text: desc,
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
                            type: 'message',
                            label: '立即領取免費體驗 🎁',
                            text: '我要預約'
                        },
                        color: '#FF9900'
                    },
                    {
                        type: 'text',
                        text: '限時優惠：現在預約再送「英語能力分析報告」！',
                        size: 'xxs',
                        color: '#aaaaaa',
                        align: 'center',
                        margin: 'sm'
                    }
                ]
            }
        }
    };
}

module.exports = {
    knowledgeBase,
    buildSystemPrompt,
    getVideoFlexMessage,
    getWelcomeFlexMessage,
    getAgeSelectionFlexMessage,
    getPersonalitySelectionFlexMessage,
    getRecommendationFlexMessage
};

