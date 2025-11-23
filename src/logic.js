const knowledgeBase = [
    {
        heading: '品牌與課程特色',
        details: [
            'OiKID 是專為 3-15 歲設計的線上英語學習平台。',
            '教材特色：參考美國 CCSS 與台灣 108 課綱，獨家研發「螺旋式學習」教材，讓孩子在不同階段重複接觸核心觀念，自然加深記憶。',
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
    // ... (rest of knowledgeBase)
];

// ... (buildKnowledgeContext, buildSystemPrompt, getVideoFlexMessage remain same)

function getWelcomeFlexMessage() {
    return {
        type: 'flex',
        altText: '歡迎來到 OiKID！🌱 (v5)',
        contents: {
            type: 'bubble',
            hero: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000', // Happy child learning
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
                            label: '了解 OiKID 課程',
                            text: '課程介紹'
                        }
                    }
                ]
            }
        }
    };
}

function getTeacherIntroFlexMessage() {
    return {
        type: 'flex',
        altText: 'OiKID 專業師資團隊',
        contents: {
            type: 'bubble',
            hero: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000', // Teacher image
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover'
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: '👩‍🏫 專業師資團隊',
                        weight: 'bold',
                        size: 'xl'
                    },
                    {
                        type: 'text',
                        text: '嚴選具備 TESOL/TEFL 證照的專業教師。',
                        margin: 'md',
                        size: 'sm',
                        color: '#666666'
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'md',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'text',
                                text: '• 雙語師：幼教背景，建立自信',
                                size: 'xs',
                                color: '#666666'
                            },
                            {
                                type: 'text',
                                text: '• 外籍師：來自美加英澳 🇺🇸🇬🇧🇨🇦🇦🇺',
                                size: 'xs',
                                color: '#666666'
                            }
                        ]
                    }
                ]
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        action: {
                            type: 'message',
                            label: '預約體驗',
                            text: '我要預約'
                        },
                        color: '#FF9900'
                    }
                ]
            }
        }
    };
}

function getCurriculumIntroFlexMessage() {
    return {
        type: 'flex',
        altText: 'OiKID 獨家螺旋式教材介紹',
        contents: {
            type: 'carousel',
            contents: [
                {
                    type: 'bubble',
                    hero: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000', // Spiral Learning
                        size: 'full',
                        aspectRatio: '20:13',
                        aspectMode: 'cover'
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: '🌀 獨家螺旋式學習法',
                                weight: 'bold',
                                size: 'xl'
                            },
                            {
                                type: 'text',
                                text: '讓語感自然「長」出來，而非死記硬背。',
                                margin: 'md',
                                size: 'sm',
                                color: '#666666'
                            },
                            {
                                type: 'box',
                                layout: 'vertical',
                                margin: 'md',
                                spacing: 'sm',
                                contents: [
                                    {
                                        type: 'text',
                                        text: '• 觀念循環：舊觀念複習 + 新知識延伸',
                                        size: 'xs',
                                        color: '#666666'
                                    },
                                    {
                                        type: 'text',
                                        text: '• 深度堆疊：從單字 → 句子 → 故事表達',
                                        size: 'xs',
                                        color: '#666666'
                                    },
                                    {
                                        type: 'text',
                                        text: '• 建立自信：在熟悉的基礎上挑戰新知',
                                        size: 'xs',
                                        color: '#666666'
                                    }
                                ]
                            }
                        ]
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'button',
                                style: 'primary',
                                action: {
                                    type: 'message',
                                    label: '了解更多',
                                    text: '課程內容'
                                },
                                color: '#FF9900'
                            }
                        ]
                    }
                },
                {
                    type: 'bubble',
                    hero: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000', // Interdisciplinary
                        size: 'full',
                        aspectRatio: '20:13',
                        aspectMode: 'cover'
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: '🌍 跨領域學科英語',
                                weight: 'bold',
                                size: 'xl'
                            },
                            {
                                type: 'text',
                                text: '對標美國 CCSS 與台灣 108 課綱。',
                                margin: 'md',
                                size: 'sm',
                                color: '#666666'
                            },
                            {
                                type: 'box',
                                layout: 'vertical',
                                margin: 'md',
                                spacing: 'sm',
                                contents: [
                                    {
                                        type: 'text',
                                        text: '• 學科整合：用英文學數學、科學、社會',
                                        size: 'xs',
                                        color: '#666666'
                                    },
                                    {
                                        type: 'text',
                                        text: '• 邏輯思考：培養解決問題的能力',
                                        size: 'xs',
                                        color: '#666666'
                                    },
                                    {
                                        type: 'text',
                                        text: '• 生活應用：將語言落實於真實情境',
                                        size: 'xs',
                                        color: '#666666'
                                    }
                                ]
                            }
                        ]
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'button',
                                style: 'primary',
                                action: {
                                    type: 'message',
                                    label: '預約體驗',
                                    text: '我要預約'
                                },
                                color: '#FF9900'
                            }
                        ]
                    }
                },
                {
                    type: 'bubble',
                    hero: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000', // Analysis
                        size: 'full',
                        aspectRatio: '20:13',
                        aspectMode: 'cover'
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: '📊 學習成效可視化',
                                weight: 'bold',
                                size: 'xl'
                            },
                            {
                                type: 'text',
                                text: '完整的學習閉環，確保每一堂課的吸收。',
                                margin: 'md',
                                size: 'sm',
                                color: '#666666'
                            },
                            {
                                type: 'box',
                                layout: 'vertical',
                                margin: 'md',
                                spacing: 'sm',
                                contents: [
                                    {
                                        type: 'text',
                                        text: '• 標準流程：暖身→複習→新知→練習→產出',
                                        size: 'xs',
                                        color: '#666666'
                                    },
                                    {
                                        type: 'text',
                                        text: '• 課後分析：提供各項能力雷達圖報告',
                                        size: 'xs',
                                        color: '#666666'
                                    },
                                    {
                                        type: 'text',
                                        text: '• 錄影回放：隨時複習上課精彩片段',
                                        size: 'xs',
                                        color: '#666666'
                                    }
                                ]
                            }
                        ]
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'button',
                                style: 'primary',
                                action: {
                                    type: 'message',
                                    label: '領取分析報告',
                                    text: '我要預約'
                                },
                                color: '#FF9900'
                            }
                        ]
                    }
                }
            ]
        }
    };
}



// ... (knowledgeBase is defined above)

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
                url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000', // Happy child learning
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

function getRecommendationFlexMessage(personality, age) {
    const isShy = personality.includes('害羞');
    const isYoung = age && age.includes('3-6');

    const title = isShy ? '推薦：親切雙語老師 🛡️' : '推薦：熱情外籍老師 🌍';
    let desc = isShy
        ? '針對比較害羞的孩子，我們推薦具備幼教背景的「雙語老師」，能用中文輔助引導，讓孩子更有安全感，建立自信開口說！💪'
        : '針對活潑的孩子，我們推薦肢體語言豐富的「外籍老師」，能提供全美語的沉浸式環境，讓孩子盡情發揮，學得更快！🚀';

    if (isYoung) {
        desc += '\n\n(針對學齡前寶貝，我們採用遊戲化教學，25分鐘剛剛好，不用擔心坐不住喔！😊)';
    }

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
    getRecommendationFlexMessage,
    getTeacherIntroFlexMessage,
    getCurriculumIntroFlexMessage
};


