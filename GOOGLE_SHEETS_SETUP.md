# Google Sheets 設定指南

這份文件將引導你完成 Google Sheets API 的設定，讓 LINE Bot 能夠將名單儲存到 Google Sheets。

## 📋 目錄

1. [建立 Google Cloud 專案](#1-建立-google-cloud-專案)
2. [啟用 Google Sheets API](#2-啟用-google-sheets-api)
3. [建立服務帳戶](#3-建立服務帳戶)
4. [建立 Google 試算表](#4-建立-google-試算表)
5. [設定環境變數](#5-設定環境變數)
6. [部署到 Render](#6-部署到-render)

---

## 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊上方的「選取專案」→「新增專案」
3. 輸入專案名稱（例如：`OiKID LINE Bot`）
4. 點擊「建立」

---

## 2. 啟用 Google Sheets API

1. 在你的專案中，前往左側選單「API 和服務」→「程式庫」
2. 搜尋「Google Sheets API」
3. 點擊進入後，按下「啟用」按鈕

---

## 3. 建立服務帳戶

1. 前往「API 和服務」→「憑證」
2. 點擊「建立憑證」→「服務帳戶」
3. 輸入服務帳戶名稱（例如：`line-bot-sheets`）
4. 點擊「建立並繼續」
5. 略過選用步驟，點擊「完成」
6. 點擊剛建立的服務帳戶
7. 前往「金鑰」分頁 → 「新增金鑰」→「建立新的金鑰」
8. 選擇「JSON」格式，點擊「建立」
9. **妥善保存下載的 JSON 檔案**（請勿分享給他人）

### 📄 JSON 檔案範例

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "line-bot-sheets@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

你需要從這個檔案中取得：
- `client_email` → 這是你的 **GOOGLE_SERVICE_ACCOUNT_EMAIL**
- `private_key` → 這是你的 **GOOGLE_PRIVATE_KEY**

---

## 4. 建立 Google 試算表

1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新的試算表
3. 命名試算表（例如：`OiKID Leads`）
4. **在第一列加入標題**：
   ```
   timestamp | name | phone | preferredTime | status
   ```
5. 複製試算表 ID（從網址中取得）
   - 網址格式：`https://docs.google.com/spreadsheets/d/【這串就是 ID】/edit`
   - 例如：`1a2b3c4d5e6f7g8h9i0j`
6. 點擊右上角「共用」按鈕
7. **貼上服務帳戶的 email**（從 JSON 檔案的 `client_email` 取得）
   - 例如：`line-bot-sheets@your-project-id.iam.gserviceaccount.com`
8. 給予「編輯者」權限
9. 取消勾選「通知使用者」
10. 點擊「共用」

---

## 5. 設定環境變數

### 本地開發（.env 檔案）

在專案根目錄的 `.env` 檔案中加入以下三個變數：

```bash
# Google Sheets Integration
GOOGLE_SHEETS_ID=你的試算表ID
GOOGLE_SERVICE_ACCOUNT_EMAIL=line-bot-sheets@your-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n你的私密金鑰內容\n-----END PRIVATE KEY-----\n"
```

⚠️ **注意事項**：
- `GOOGLE_PRIVATE_KEY` 必須用雙引號包起來
- 保留 `\n` 換行符號（不要替換成實際換行）
- 私密金鑰包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`

---

## 6. 部署到 Render

1. 登入 [Render Dashboard](https://dashboard.render.com/)
2. 找到你的 `line-oa-gemini-bot` 服務
3. 前往「Environment」分頁
4. 新增以下三個環境變數：

| Key | Value |
|-----|-------|
| `GOOGLE_SHEETS_ID` | 你的試算表 ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 服務帳戶 email |
| `GOOGLE_PRIVATE_KEY` | 完整的私密金鑰（包含 BEGIN 和 END） |

5. 點擊「Save Changes」
6. Render 會自動重新部署你的應用程式

---

## ✅ 測試

完成設定後，測試 LINE Bot 的預約流程：

1. 在 LINE 中傳送「立即預約體驗」
2. 依序輸入：姓名 → 電話 → 方便時段
3. 檢查 Google Sheets，應該會看到新的一筆資料

---

## 🔧 疑難排解

### 錯誤：Missing Google Sheets credentials
- 檢查環境變數是否正確設定
- 確認變數名稱拼寫正確

### 錯誤：Permission denied
- 確認試算表已與服務帳戶 email 共用
- 檢查服務帳戶是否有「編輯者」權限

### 錯誤：Invalid private key
- 確認私密金鑰包含完整的 BEGIN 和 END 標記
- 檢查是否有保留 `\n` 換行符號
- 確認私密金鑰用雙引號包起來

---

## 📞 需要協助？

如果在設定過程中遇到任何問題，請隨時詢問！
