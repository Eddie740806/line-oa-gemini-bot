require('dotenv').config();

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY is missing in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => {
                    if (m.name.includes('gemini')) {
                        console.log(`- ${m.name} (Supported methods: ${m.supportedGenerationMethods})`);
                    }
                });
            } else {
                console.log("No models returned.");
            }
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

checkModels();
