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

function getCourseIntroFlexMessage() {
    return {
        type: 'flex',
        altText: 'OiKID 師資與教材介紹',
        contents: {
            type: 'carousel',
            contents: [
                {
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
                                        text: '• 外籍師：純正口音，沉浸學習',
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
                        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000', // Curriculum image
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
                                text: '📚 獨家螺旋式教材',
                                weight: 'bold',
                                size: 'xl'
                            },
                            {
                                type: 'text',
                                text: '結合美國 CCSS 與台灣 108 課綱。',
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
                                        text: '• 螺旋式學習：循序漸進，加深記憶',
                                        size: 'xs',
                                        color: '#666666'
                                    },
                                    {
                                        type: 'text',
                                        text: '• 遊戲化教學：讓孩子愛上開口說',
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
                }
            ]
        }
    };
}

function getWelcomeFlexMessage() {
    return {
        type: 'flex',
        altText: '歡迎來到 OiKID！🌱 (v3)',
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
                            label: '🏫 認識師資與教材',
                            text: '認識師資與教材'
                        }
                    },
                    {
                        type: 'button',
                        style: 'link',
                        height: 'sm',
                        action: {
                            type: 'message',
                            label: '📺 觀看上課影片',
                            text: '觀看上課影片'
                        }
                    }
                ],
                flex: 0
            }
        }
    };
}

// ... (other functions)

module.exports = {
    knowledgeBase,
    buildSystemPrompt,
    getVideoFlexMessage,
    getWelcomeFlexMessage,
    getAgeSelectionFlexMessage,
    getPersonalitySelectionFlexMessage,
    getRecommendationFlexMessage,
    getCourseIntroFlexMessage
};


