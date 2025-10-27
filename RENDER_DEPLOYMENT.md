# Render.com 部署指南

本指南將協助您將租賃物件資訊聚合平台部署到 Render.com。

## 前置準備

### 1. 註冊 Render 帳號

前往 [Render.com](https://render.com/) 註冊免費帳號。

### 2. 準備資料庫

**選項 A：使用 PlanetScale（推薦）**

1. 前往 [PlanetScale](https://planetscale.com/) 註冊免費帳號
2. 建立新資料庫
3. 取得連接字串（格式：`mysql://user:password@host/database?ssl={"rejectUnauthorized":true}`）

**選項 B：使用 Render PostgreSQL**

1. 在 Render Dashboard 點擊「New +」
2. 選擇「PostgreSQL」
3. 建立免費資料庫
4. 取得 Internal Database URL

**注意：** 本專案使用 MySQL，如果使用 PostgreSQL 需要修改 Drizzle 配置。

---

## 部署步驟

### 方法 1：使用 render.yaml 自動部署（推薦）

1. **連接 GitHub 儲存庫**
   - 登入 Render Dashboard
   - 點擊「New +」→「Blueprint」
   - 選擇您的 GitHub 儲存庫
   - Render 會自動讀取 `render.yaml` 配置

2. **設定環境變數**
   
   在部署前，需要設定以下環境變數：
   
   - `DATABASE_URL` - 資料庫連接字串（必填）
   - `JWT_SECRET` - 自動生成或手動設定
   - 其他變數已在 render.yaml 中預設

3. **部署**
   - 點擊「Apply」開始部署
   - 等待建置完成（約 5-10 分鐘）

### 方法 2：手動建立 Web Service

1. **建立 Web Service**
   - 登入 Render Dashboard
   - 點擊「New +」→「Web Service」
   - 連接您的 GitHub 儲存庫
   - 選擇 `rental-property-aggregator` 儲存庫

2. **基本設定**
   - **Name**: `rental-property-aggregator`（或您喜歡的名稱）
   - **Region**: 選擇 `Singapore (Southeast Asia)` 或其他較近的區域
   - **Branch**: `master`
   - **Root Directory**: 留空
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install -g pnpm && pnpm install && pnpm build
     ```
   - **Start Command**: 
     ```bash
     pnpm start
     ```

3. **進階設定**
   - **Instance Type**: 選擇 `Free`（免費方案）

4. **環境變數設定**

   點擊「Environment」標籤，新增以下環境變數：

   **必填變數：**
   ```
   NODE_ENV=production
   DATABASE_URL=<您的資料庫連接字串>
   JWT_SECRET=<隨機生成的密鑰，至少 32 字元>
   ```

   **選填變數（使用預設值）：**
   ```
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://login.manus.im
   VITE_APP_TITLE=租賃物件資訊聚合平台
   VITE_APP_LOGO=https://via.placeholder.com/150
   ```

   **生成 JWT_SECRET 的方法：**
   ```bash
   # 在終端機執行
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **建立服務**
   - 點擊「Create Web Service」
   - Render 會自動開始建置和部署

---

## 初始化資料庫

部署完成後，需要初始化資料庫結構：

### 方法 1：使用 Render Shell

1. 在 Render Dashboard 中，進入您的 Web Service
2. 點擊「Shell」標籤
3. 執行以下指令：
   ```bash
   pnpm db:push
   ```

### 方法 2：本地執行（需要資料庫連接）

```bash
# 設定環境變數
export DATABASE_URL="<您的資料庫連接字串>"

# 執行資料庫遷移
pnpm db:push
```

---

## 驗證部署

1. **檢查服務狀態**
   - 在 Render Dashboard 中查看服務狀態
   - 確認顯示為「Live」

2. **訪問網站**
   - 點擊 Render 提供的網址（格式：`https://your-app.onrender.com`）
   - 確認網站正常運行

3. **測試功能**
   - 測試物件列表顯示
   - 測試篩選功能
   - 測試管理後台（需要登入）

---

## 常見問題

### Q1: 建置失敗，顯示 "pnpm: command not found"

**解決方法：** 確認 Build Command 包含 `npm install -g pnpm`：
```bash
npm install -g pnpm && pnpm install && pnpm build
```

### Q2: 網站顯示 "Application Error"

**可能原因：**
1. 環境變數設定錯誤
2. 資料庫連接失敗
3. 未執行資料庫初始化

**解決方法：**
1. 檢查 Render Logs 查看詳細錯誤訊息
2. 確認 `DATABASE_URL` 正確
3. 執行 `pnpm db:push` 初始化資料庫

### Q3: 建置時間過長

**說明：** 首次建置可能需要 5-10 分鐘，這是正常現象。後續部署會使用快取，速度會更快。

### Q4: 免費方案的限制

Render 免費方案限制：
- 服務閒置 15 分鐘後會自動休眠
- 首次喚醒可能需要 30-60 秒
- 每月 750 小時免費運行時間
- 適合開發和測試使用

---

## 自動部署

Render 會自動監聽 GitHub 儲存庫的變更：

1. 推送程式碼到 `master` 分支
2. Render 自動觸發建置和部署
3. 部署完成後自動更新網站

---

## 自訂網域

如果您有自己的網域：

1. 在 Render Dashboard 中進入您的 Web Service
2. 點擊「Settings」→「Custom Domain」
3. 新增您的網域
4. 按照指示設定 DNS 記錄

---

## 監控和日誌

### 查看日誌

1. 在 Render Dashboard 中進入您的 Web Service
2. 點擊「Logs」標籤
3. 即時查看應用程式日誌

### 效能監控

Render 提供基本的效能監控：
- CPU 使用率
- 記憶體使用率
- 請求數量

---

## 成本估算

**免費方案：**
- Web Service: 免費（有限制）
- 資料庫: 使用 PlanetScale 免費方案

**付費方案：**
- Starter: $7/月（無休眠限制）
- Standard: $25/月（更多資源）

---

## 支援

如有問題，請參考：
- [Render 官方文件](https://render.com/docs)
- [專案 GitHub Issues](https://github.com/simon4657/rental-property-aggregator/issues)

---

## 部署檢查清單

- [ ] 註冊 Render 帳號
- [ ] 準備資料庫（PlanetScale 或其他）
- [ ] 連接 GitHub 儲存庫
- [ ] 設定環境變數（特別是 DATABASE_URL）
- [ ] 建立 Web Service
- [ ] 等待建置完成
- [ ] 執行 `pnpm db:push` 初始化資料庫
- [ ] 訪問網站驗證功能
- [ ] （選填）設定自訂網域

完成以上步驟後，您的租賃物件資訊聚合平台就成功部署到 Render.com 了！

