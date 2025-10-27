# Render Web Service 部署完整教學

本指南將一步步帶您使用 Render 的 Web Service 功能部署租賃物件資訊聚合平台。

---

## 📋 前置準備

### 1. 註冊 Render 帳號

1. 前往 [Render.com](https://render.com/)
2. 點擊右上角「Get Started」
3. 使用 GitHub 帳號登入（推薦）或使用 Email 註冊

### 2. 準備資料庫

本專案使用 MySQL 資料庫，推薦使用 **PlanetScale** 免費方案：

#### 註冊 PlanetScale

1. 前往 [PlanetScale](https://planetscale.com/)
2. 使用 GitHub 帳號登入
3. 點擊「Create a database」
4. 輸入資料庫名稱（例如：`rental-db`）
5. 選擇區域：`AWS - ap-southeast-1 (Singapore)` 或 `AWS - ap-northeast-1 (Tokyo)`
6. 點擊「Create database」

#### 取得資料庫連接字串

1. 進入您的資料庫
2. 點擊「Connect」
3. 選擇「Connect with: Prisma」（或 Node.js）
4. 複製 `DATABASE_URL`，格式類似：
   ```
   mysql://username:password@host.us-east-1.psdb.cloud/database-name?sslaccept=strict
   ```

---

## 🚀 部署步驟

### 步驟 1：建立 Web Service

1. **登入 Render Dashboard**
   - 前往 [Render Dashboard](https://dashboard.render.com/)

2. **建立新服務**
   - 點擊右上角「New +」按鈕
   - 選擇「Web Service」

3. **連接 GitHub 儲存庫**
   - 如果是第一次使用，點擊「Connect GitHub」授權 Render 存取您的 GitHub
   - 在儲存庫列表中找到 `rental-property-aggregator`
   - 點擊「Connect」

### 步驟 2：設定 Web Service

#### 基本設定

- **Name**（服務名稱）：`rental-property-aggregator`
  - 這會成為您的網址：`https://rental-property-aggregator.onrender.com`
  - 可以自訂名稱，例如：`my-rental-app`

- **Region**（區域）：選擇 `Singapore (Southeast Asia)`
  - 選擇離您最近的區域可以獲得更快的速度

- **Branch**（分支）：`master`
  - 選擇要部署的 Git 分支

- **Root Directory**（根目錄）：留空
  - 專案在儲存庫根目錄，不需要填寫

- **Runtime**（執行環境）：`Node`
  - 系統會自動偵測

#### 建置設定

- **Build Command**（建置指令）：
  ```bash
  npm install -g pnpm && pnpm install && pnpm build
  ```
  
  **說明**：
  - `npm install -g pnpm`：安裝 pnpm 套件管理器
  - `pnpm install`：安裝專案依賴
  - `pnpm build`：建置前端和後端

- **Start Command**（啟動指令）：
  ```bash
  pnpm start
  ```
  
  **說明**：啟動 Node.js 伺服器

#### 方案選擇

- **Instance Type**（實例類型）：選擇 `Free`
  - 免費方案已足夠測試使用
  - 限制：閒置 15 分鐘後會休眠，首次喚醒需要 30-60 秒

### 步驟 3：設定環境變數

點擊「Environment」標籤，新增以下環境變數：

#### 必填變數

1. **NODE_ENV**
   - Value: `production`
   - 說明：設定為生產環境

2. **DATABASE_URL**
   - Value: `您的 PlanetScale 資料庫連接字串`
   - 說明：資料庫連接字串
   - 範例：`mysql://user:pass@host.psdb.cloud/dbname?sslaccept=strict`

3. **JWT_SECRET**
   - Value: `隨機生成的 32 字元以上密鑰`
   - 說明：用於加密 Session
   - 生成方式：在終端機執行
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - 或使用線上工具：https://randomkeygen.com/

#### 選填變數（使用預設值）

以下變數已有預設值，可以不設定：

4. **OAUTH_SERVER_URL**
   - Value: `https://api.manus.im`
   - 說明：OAuth 伺服器網址（本專案已移除登入功能，可不設定）

5. **VITE_OAUTH_PORTAL_URL**
   - Value: `https://login.manus.im`
   - 說明：OAuth 登入頁面網址（本專案已移除登入功能，可不設定）

6. **VITE_APP_TITLE**
   - Value: `租賃物件資訊聚合平台`
   - 說明：網站標題

7. **VITE_APP_LOGO**
   - Value: `https://via.placeholder.com/150`
   - 說明：網站 Logo 網址（可替換為您的 Logo）

### 步驟 4：建立服務

1. 檢查所有設定是否正確
2. 點擊頁面底部的「Create Web Service」按鈕
3. Render 會開始建置和部署

---

## ⏳ 等待部署完成

### 建置過程

部署過程大約需要 **5-10 分鐘**，您會看到以下階段：

1. **Building**（建置中）
   - 下載程式碼
   - 安裝 pnpm
   - 安裝依賴套件
   - 建置前端和後端

2. **Deploying**（部署中）
   - 啟動伺服器
   - 執行健康檢查

3. **Live**（運行中）
   - 部署成功！

### 查看建置日誌

點擊「Logs」標籤可以即時查看建置和運行日誌，如果遇到錯誤可以在這裡找到詳細資訊。

---

## 🔧 初始化資料庫

部署完成後，需要初始化資料庫結構：

### 方法 1：使用 Render Shell（推薦）

1. 在 Render Dashboard 中，進入您的 Web Service
2. 點擊右上角的「Shell」標籤
3. 等待 Shell 連線成功
4. 執行以下指令：
   ```bash
   pnpm db:push
   ```
5. 等待執行完成，看到「✓ Done」表示成功

### 方法 2：本地執行（需要資料庫連接）

如果您有本地開發環境：

```bash
# 設定環境變數
export DATABASE_URL="您的資料庫連接字串"

# 執行資料庫遷移
pnpm db:push
```

---

## ✅ 驗證部署

### 1. 檢查服務狀態

在 Render Dashboard 中，確認服務狀態顯示為「Live」（綠色）。

### 2. 訪問網站

點擊 Render 提供的網址（在頁面頂部），格式類似：
```
https://rental-property-aggregator.onrender.com
```

### 3. 測試功能

- **首頁**：應該可以看到物件列表（目前是空的）
- **管理後台**：點擊右上角「管理後台」，測試新增物件功能
- **資料抓取**：點擊「資料抓取」，測試 CSV 匯入功能

---

## 📝 常見問題

### Q1: 建置失敗，顯示 "pnpm: command not found"

**原因**：Build Command 沒有安裝 pnpm

**解決方法**：確認 Build Command 為：
```bash
npm install -g pnpm && pnpm install && pnpm build
```

### Q2: 網站顯示 "Application Error"

**可能原因**：
1. 環境變數設定錯誤
2. 資料庫連接失敗
3. 未執行資料庫初始化

**解決方法**：
1. 檢查 Render Logs 查看詳細錯誤訊息
2. 確認 `DATABASE_URL` 正確且資料庫可連線
3. 執行 `pnpm db:push` 初始化資料庫結構

### Q3: 網站很慢或無法連線

**原因**：免費方案在閒置 15 分鐘後會自動休眠

**說明**：
- 首次喚醒需要 30-60 秒
- 這是免費方案的正常限制
- 升級到付費方案（$7/月）可以避免休眠

### Q4: 資料庫連接錯誤

**檢查項目**：
1. DATABASE_URL 格式是否正確
2. PlanetScale 資料庫是否正常運行
3. 連接字串中的密碼是否正確
4. 是否包含 `?sslaccept=strict` 參數

### Q5: 如何查看錯誤日誌？

1. 進入 Render Dashboard
2. 點擊您的 Web Service
3. 點擊「Logs」標籤
4. 即時查看應用程式日誌

---

## 🔄 自動部署

Render 會自動監聽 GitHub 儲存庫的變更：

1. 當您推送程式碼到 `master` 分支
2. Render 會自動觸發建置和部署
3. 部署完成後自動更新網站

**停用自動部署**：
- 在 Settings 中可以關閉「Auto-Deploy」選項

---

## 🌐 自訂網域

如果您有自己的網域，可以綁定到 Render：

### 步驟

1. 在 Render Dashboard 中進入您的 Web Service
2. 點擊「Settings」標籤
3. 找到「Custom Domain」區塊
4. 點擊「Add Custom Domain」
5. 輸入您的網域（例如：`rental.yourdomain.com`）
6. 按照指示設定 DNS 記錄：
   - 新增 CNAME 記錄
   - Name: `rental`（或您的子網域）
   - Value: `rental-property-aggregator.onrender.com`
7. 等待 DNS 生效（通常需要幾分鐘到幾小時）
8. Render 會自動配置 SSL 憑證

---

## 💰 費用說明

### 免費方案

- **價格**：$0/月
- **限制**：
  - 閒置 15 分鐘後自動休眠
  - 每月 750 小時免費運行時間
  - 共享 CPU 和記憶體
- **適合**：開發、測試、個人專案

### Starter 方案

- **價格**：$7/月
- **優勢**：
  - 無休眠限制
  - 更快的回應速度
  - 更多資源
- **適合**：正式使用、小型商業專案

### 資料庫費用

- **PlanetScale 免費方案**：
  - 1 個資料庫
  - 5 GB 儲存空間
  - 10 億次讀取/月
  - 1000 萬次寫入/月
  - 足夠個人和小型專案使用

---

## 📊 監控和維護

### 查看效能指標

1. 進入 Render Dashboard
2. 點擊您的 Web Service
3. 點擊「Metrics」標籤
4. 查看：
   - CPU 使用率
   - 記憶體使用率
   - 請求數量
   - 回應時間

### 重新部署

如果需要手動重新部署：

1. 進入 Render Dashboard
2. 點擊您的 Web Service
3. 點擊右上角「Manual Deploy」
4. 選擇「Clear build cache & deploy」（清除快取並重新建置）

---

## 🎯 部署檢查清單

使用此清單確保部署順利：

- [ ] 已註冊 Render 帳號
- [ ] 已建立 PlanetScale 資料庫
- [ ] 已取得資料庫連接字串
- [ ] 已在 Render 建立 Web Service
- [ ] 已連接 GitHub 儲存庫
- [ ] Build Command 設定為：`npm install -g pnpm && pnpm install && pnpm build`
- [ ] Start Command 設定為：`pnpm start`
- [ ] 已設定環境變數：`NODE_ENV`、`DATABASE_URL`、`JWT_SECRET`
- [ ] 已點擊「Create Web Service」
- [ ] 等待建置完成（5-10 分鐘）
- [ ] 服務狀態顯示為「Live」
- [ ] 已執行 `pnpm db:push` 初始化資料庫
- [ ] 已訪問網站驗證功能正常

---

## 📚 相關資源

- **Render 官方文件**：https://render.com/docs
- **PlanetScale 文件**：https://planetscale.com/docs
- **專案 GitHub**：https://github.com/simon4657/rental-property-aggregator
- **專案部署指南**：`RENDER_DEPLOYMENT.md`

---

## 🆘 需要協助？

如果遇到問題：

1. 查看 Render Logs 尋找錯誤訊息
2. 參考本文件的「常見問題」章節
3. 查閱 [Render 官方文件](https://render.com/docs)
4. 在專案 GitHub 提交 Issue

---

## 🎉 完成！

恭喜您成功部署租賃物件資訊聚合平台！

您的網站現在已經上線，可以：
- 瀏覽和搜尋租賃物件
- 使用管理後台新增、編輯物件
- 使用 CSV 批量匯入資料
- 分享網址給其他人使用

祝您使用愉快！

