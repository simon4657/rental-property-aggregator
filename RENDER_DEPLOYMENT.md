# Render 部署指南

本指南將協助您將租賃物件資訊聚合平台部署到 Render。

## 📋 前置準備

### 1. 註冊 Render 帳號

前往 [Render](https://render.com/) 註冊帳號（可使用 GitHub 帳號登入）。

### 2. 準備資料庫

Render 提供免費的 PostgreSQL 資料庫，但本專案使用 MySQL。您有以下選擇：

**選項 A：使用外部 MySQL 資料庫（推薦）**
- [PlanetScale](https://planetscale.com/) - 免費 MySQL 資料庫
- [Railway](https://railway.app/) - 提供 MySQL 服務
- [Aiven](https://aiven.io/) - 提供 MySQL 服務

**選項 B：修改為使用 PostgreSQL**
- 使用 Render 提供的免費 PostgreSQL
- 需要修改 Drizzle 配置

本指南以使用 PlanetScale 為例。

## 🚀 部署步驟

### 步驟 1：建立 PlanetScale 資料庫

1. 前往 [PlanetScale](https://planetscale.com/) 註冊帳號
2. 點擊「Create a new database」
3. 輸入資料庫名稱（例如：`rental-aggregator`）
4. 選擇區域（建議選擇 `AWS ap-northeast-1 (Tokyo)` 較接近台灣）
5. 點擊「Create database」

### 步驟 2：取得資料庫連接字串

1. 在 PlanetScale 控制台，點擊您的資料庫
2. 點擊「Connect」
3. 選擇「Create password」
4. 複製「Connection string」（格式類似：`mysql://user:password@host/database?ssl={"rejectUnauthorized":true}`）
5. **重要**：請妥善保存此連接字串，之後無法再次查看

### 步驟 3：在 Render 建立 Web Service

1. 登入 [Render Dashboard](https://dashboard.render.com/)
2. 點擊「New +」→「Web Service」
3. 選擇「Build and deploy from a Git repository」
4. 點擊「Connect account」連接您的 GitHub 帳號
5. 找到並選擇 `rental-property-aggregator` 儲存庫
6. 點擊「Connect」

### 步驟 4：設定 Web Service

在設定頁面填入以下資訊：

**基本設定：**
- **Name**: `rental-property-aggregator`（或您喜歡的名稱）
- **Region**: 選擇 `Singapore (Southeast Asia)` 或其他較近的區域
- **Branch**: `master`
- **Root Directory**: 留空
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  pnpm install && pnpm build
  ```
- **Start Command**: 
  ```bash
  pnpm start
  ```

**進階設定：**
- **Instance Type**: 選擇 `Free`（免費方案）

### 步驟 5：設定環境變數

在「Environment」區段，點擊「Add Environment Variable」，新增以下環境變數：

#### 必要環境變數

| Key | Value | 說明 |
|-----|-------|------|
| `DATABASE_URL` | `mysql://...` | 從 PlanetScale 複製的連接字串 |
| `JWT_SECRET` | `your-random-secret-key` | 隨機生成的密鑰（至少 32 字元） |
| `NODE_VERSION` | `22.13.0` | Node.js 版本 |
| `PNPM_VERSION` | `9.0.0` | pnpm 版本 |

#### OAuth 相關環境變數（如需使用登入功能）

| Key | Value | 說明 |
|-----|-------|------|
| `VITE_APP_ID` | `your-app-id` | OAuth 應用 ID |
| `OAUTH_SERVER_URL` | `https://api.manus.im` | OAuth 伺服器 URL |
| `VITE_OAUTH_PORTAL_URL` | `https://oauth.manus.im` | OAuth 登入頁面 URL |
| `OWNER_OPEN_ID` | `your-open-id` | 擁有者 Open ID |
| `OWNER_NAME` | `Your Name` | 擁有者名稱 |

#### 應用程式設定

| Key | Value | 說明 |
|-----|-------|------|
| `VITE_APP_TITLE` | `租賃物件資訊聚合平台` | 應用程式標題 |
| `VITE_APP_LOGO` | `https://your-logo-url.com/logo.png` | Logo 網址（選填） |

### 步驟 6：部署

1. 檢查所有設定是否正確
2. 點擊「Create Web Service」
3. Render 會自動開始建置和部署
4. 等待部署完成（通常需要 5-10 分鐘）

### 步驟 7：初始化資料庫

部署完成後，需要初始化資料庫結構：

1. 在 Render Dashboard 中，點擊您的 Web Service
2. 點擊「Shell」標籤
3. 執行以下指令：
   ```bash
   pnpm db:push
   ```
4. 等待資料庫初始化完成

### 步驟 8：新增測試資料（選填）

如果需要測試資料：

```bash
npx tsx scripts/seed-data.ts
```

### 步驟 9：訪問您的應用程式

1. 部署完成後，Render 會提供一個網址，格式類似：
   ```
   https://rental-property-aggregator.onrender.com
   ```
2. 點擊該網址即可訪問您的應用程式

## 🔧 進階設定

### 自訂網域

1. 在 Render Dashboard 中，點擊您的 Web Service
2. 點擊「Settings」標籤
3. 找到「Custom Domain」區段
4. 點擊「Add Custom Domain」
5. 輸入您的網域名稱
6. 按照指示在您的網域提供商設定 DNS 記錄

### 環境變數管理

如需修改環境變數：

1. 在 Render Dashboard 中，點擊您的 Web Service
2. 點擊「Environment」標籤
3. 修改或新增環境變數
4. 點擊「Save Changes」
5. Render 會自動重新部署

### 自動部署

Render 預設會在您推送程式碼到 GitHub 時自動部署。如需停用：

1. 在「Settings」標籤
2. 找到「Auto-Deploy」區段
3. 選擇「No」

### 查看日誌

1. 在 Render Dashboard 中，點擊您的 Web Service
2. 點擊「Logs」標籤
3. 即可查看即時日誌

## 📊 監控與維護

### 健康檢查

Render 會自動進行健康檢查。如需自訂：

1. 在「Settings」標籤
2. 找到「Health Check Path」
3. 輸入健康檢查路徑（例如：`/api/health`）

### 效能監控

1. 在 Render Dashboard 查看「Metrics」標籤
2. 可以看到 CPU、記憶體使用情況
3. 免費方案有資源限制，如需更多資源請升級方案

## ⚠️ 注意事項

### 免費方案限制

- **睡眠機制**：閒置 15 分鐘後會進入睡眠狀態，下次訪問需要 30-60 秒喚醒
- **每月 750 小時**：免費方案提供 750 小時運行時間
- **記憶體限制**：512 MB RAM
- **CPU 限制**：共享 CPU

### 避免睡眠

如需保持服務持續運行：

1. 升級到付費方案（$7/月起）
2. 使用外部監控服務定期 ping 您的網站（例如：UptimeRobot）

### 資料庫連接

- 確保資料庫連接字串包含 SSL 設定
- PlanetScale 預設啟用 SSL，連接字串已包含相關設定

## 🐛 常見問題

### Q: 部署失敗，顯示「Build failed」？

**A:** 檢查以下項目：
1. 確認 `package.json` 中有正確的 `build` 和 `start` 腳本
2. 檢查 Node.js 版本是否正確
3. 查看 Build Logs 了解具體錯誤訊息

### Q: 應用程式無法連接資料庫？

**A:** 檢查：
1. `DATABASE_URL` 環境變數是否正確設定
2. 資料庫是否已初始化（執行 `pnpm db:push`）
3. 資料庫服務是否正常運行

### Q: 網站載入很慢？

**A:** 可能原因：
1. 免費方案從睡眠中喚醒需要時間
2. 資料庫查詢效能問題
3. 考慮升級到付費方案

### Q: 如何更新應用程式？

**A:** 
1. 推送程式碼到 GitHub
2. Render 會自動偵測並重新部署
3. 或在 Render Dashboard 手動觸發部署

## 📚 相關資源

- [Render 官方文件](https://render.com/docs)
- [PlanetScale 文件](https://planetscale.com/docs)
- [專案 GitHub](https://github.com/simon4657/rental-property-aggregator)

## 🎉 完成！

恭喜！您的租賃物件資訊聚合平台已成功部署到 Render。

**下一步：**
1. 訪問您的網站確認運作正常
2. 設定瀏覽器擴充功能的 API 網址
3. 開始使用平台收集租屋資訊

如有任何問題，請參考專案的 GitHub Issues 或 Render 官方文件。

