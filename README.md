# OiKID 24h Service Support LINE Bot

This project hosts a LINE Official Account chatbot that connects to the Google Gemini API to provide 24-hour automated support for OiKID users.

## Prerequisites

- Node.js 18+
- LINE Official Account channel credentials (`Channel Access Token`, `Channel Secret`)
- Google Gemini API key
- (Optional) ngrok for local webhook tunneling

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `env.sample` to `.env` and fill in your secrets:
   ```bash
   cp env.sample .env
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The server listens on `http://localhost:3000` by default.
4. Use ngrok (or similar) to expose the webhook endpoint:
   ```bash
   ngrok http 3000
   ```
   Configure the generated HTTPS URL as the webhook URL in the LINE Developers Console (e.g. `https://<random>.ngrok.io/webhook`).

## Environment Variables

Refer to `env.sample` for the full list. At minimum you must set:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `GEMINI_API_KEY`

Optional tweaks:

- `GEMINI_MODEL` (defaults to `gemini-pro`)
- `GEMINI_SYSTEM_PROMPT` (default system instruction for responses)
- `PORT` (server port, defaults to `3000`)

## Project Structure

- `src/index.js`: Express server, LINE webhook handling, Gemini integration
- `env.sample`: Template for environment configuration

## Deployment Tips

- For production deploy to a platform that supports Node.js (e.g. Cloud Run, Render, Heroku).
- Set environment variables securely in your hosting platform.
- Regenerate and rotate LINE channel tokens if you suspect leakage.

## Development Notes

- The Gemini API usage counts against your Google AI quota; monitor usage to avoid unexpected costs.
- Extend `handleEvent` in `src/index.js` to support additional message types or commands as needed.


