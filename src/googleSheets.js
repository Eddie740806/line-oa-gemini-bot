/**
 * Google Sheets Service Module
 * Handles lead data persistence to Google Sheets
 */

const { google } = require('googleapis');

// Initialize Google Sheets API
function getGoogleSheetsClient() {
    try {
        const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;

        if (!serviceAccountEmail || !privateKey) {
            throw new Error('Missing Google Sheets credentials in environment variables');
        }

        // Replace escaped newlines in private key
        const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

        const auth = new google.auth.JWT({
            email: serviceAccountEmail,
            key: formattedPrivateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        return google.sheets({ version: 'v4', auth });
    } catch (error) {
        console.error('Error initializing Google Sheets client:', error);
        throw error;
    }
}

/**
 * Append a new lead to Google Sheets
 * @param {string} userId - LINE user ID
 * @param {Object} data - Lead data containing name, phone, preferredTime
 */
async function appendLeadToSheet(userId, data) {
    try {
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

        if (!spreadsheetId) {
            throw new Error('Missing GOOGLE_SHEETS_ID in environment variables');
        }

        const sheets = getGoogleSheetsClient();
        const timestamp = new Date().toISOString();

        // Prepare the row data
        const values = [[
            timestamp,
            data.name || '',
            data.phone || '',
            data.preferredTime || '',
            'NEW'
        ]];

        // Append to the sheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'A:E', // Columns A to E (timestamp, name, phone, preferredTime, status)
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values,
            },
        });

        console.log(`✅ Lead saved to Google Sheets for user ${userId}`);
        console.log(`   Name: ${data.name}, Phone: ${data.phone}, Time: ${data.preferredTime}`);

        return response.data;
    } catch (error) {
        console.error('❌ Error saving lead to Google Sheets:', error.message);

        // Log more details for debugging
        if (error.response) {
            console.error('   API Response Error:', error.response.data);
        }

        throw error;
    }
}

module.exports = {
    appendLeadToSheet,
};
