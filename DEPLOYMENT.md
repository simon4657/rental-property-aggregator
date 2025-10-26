# 部署指南

本文件說明如何將租賃物件資訊聚合平台部署到各種環境。

## 目錄

- [前置需求](#前置需求)
- [環境變數設定](#環境變數設定)
- [本地開發](#本地開發)
- [Docker 部署](#docker-部署)
- [GitHub 部署流程](#github-部署流程)
- [雲端平台部署](#雲端平台部署)
- [資料庫設定](#資料庫設定)
- [常見問題](#常見問題)

## 前置需求

在開始部署之前，請確保您已準備：

- Node.js 22 或更高版本
- pnpm 包管理器
- MySQL 或 TiDB 資料庫
- Git（用於版本控制）
- Docker 和 Docker Compose（選用，用於容器化部署）

## 環境變數設定

本專案需要以下環境變數。在部署前，請確保所有必要的環境變數都已正確設定。

### 必要環境變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `DATABASE_URL` | 資料庫連接字串 | `mysql://user:password@host:3306/database` |
| `JWT_SECRET` | JWT 簽名密鑰 | `your-secret-key-here` |
| `VITE_APP_ID` | OAuth 應用 ID | `your-app-id` |
| `OAUTH_SERVER_URL` | OAuth 伺服器 URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | OAuth 登入頁面 URL | `https://auth.manus.im` |

### 選用環境變數

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `OWNER_OPEN_ID` | 擁有者 Open ID | - |
| `OWNER_NAME` | 擁有者名稱 | - |
| `VITE_APP_TITLE` | 應用程式標題 | `租賃物件資訊聚合平台` |
| `VITE_APP_LOGO` | 應用程式 Logo URL | - |
| `PORT` | 伺服器端口 | `3000` |

### 設定環境變數

建立 `.env` 檔案（不要提交到 Git）：

```bash
# 複製範本
cp .env.example .env

# 編輯環境變數
nano .env
```

`.env` 檔案範例：

```env
DATABASE_URL=mysql://user:password@localhost:3306/rental_properties
JWT_SECRET=your-very-secure-secret-key-change-this
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name
VITE_APP_TITLE=租賃物件資訊聚合平台
PORT=3000
```

## 本地開發

### 1. 克隆專案

```bash
git clone <your-repository-url>
cd rental-property-aggregator
```

### 2. 安裝依賴

```bash
pnpm install
```

### 3. 設定環境變數

建立 `.env` 檔案並填入必要的環境變數（參考上方說明）。

### 4. 初始化資料庫

```bash
pnpm db:push
```

### 5. 新增測試資料（選用）

```bash
npx tsx scripts/seed-data.ts
```

### 6. 啟動開發伺服器

```bash
pnpm dev
```

應用程式將在 `http://localhost:3000` 啟動。

## Docker 部署

### 使用 Docker Compose（推薦）

這是最簡單的部署方式，會自動設定應用程式和 MySQL 資料庫。

1. **建立環境變數檔案**

```bash
cp .env.example .env
# 編輯 .env 檔案，填入必要的環境變數
```

2. **啟動服務**

```bash
docker-compose up -d
```

3. **查看日誌**

```bash
docker-compose logs -f app
```

4. **停止服務**

```bash
docker-compose down
```

### 使用 Docker（不含資料庫）

如果您已有外部資料庫，可以只部署應用程式容器。

1. **建立 Docker 映像**

```bash
docker build -t rental-aggregator .
```

2. **執行容器**

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e VITE_APP_ID="your-app-id" \
  -e OAUTH_SERVER_URL="https://api.manus.im" \
  -e VITE_OAUTH_PORTAL_URL="https://auth.manus.im" \
  --name rental-aggregator \
  rental-aggregator
```

3. **查看日誌**

```bash
docker logs -f rental-aggregator
```

## GitHub 部署流程

### 1. 建立 GitHub Repository

```bash
# 初始化 Git（如果尚未初始化）
git init

# 新增所有檔案
git add .

# 提交變更
git commit -m "Initial commit"

# 新增遠端 Repository
git remote add origin https://github.com/your-username/rental-property-aggregator.git

# 推送到 GitHub
git push -u origin main
```

### 2. 設定 GitHub Secrets

在 GitHub Repository 設定中，新增以下 Secrets：

1. 前往 Repository → Settings → Secrets and variables → Actions
2. 點擊 "New repository secret"
3. 新增以下 Secrets：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `VITE_APP_ID`
   - `OAUTH_SERVER_URL`
   - `VITE_OAUTH_PORTAL_URL`

### 3. GitHub Actions

專案已包含 `.github/workflows/deploy.yml`，會在推送到 `main` 分支時自動執行：

- 安裝依賴
- 型別檢查
- 建置應用程式
- 上傳建置產物

您可以根據需求修改此檔案，加入部署到特定平台的步驟。

## 雲端平台部署

### Vercel

1. **安裝 Vercel CLI**

```bash
npm i -g vercel
```

2. **登入 Vercel**

```bash
vercel login
```

3. **部署**

```bash
vercel
```

4. **設定環境變數**

在 Vercel Dashboard 中設定所有必要的環境變數。

### Railway

1. **安裝 Railway CLI**

```bash
npm i -g @railway/cli
```

2. **登入 Railway**

```bash
railway login
```

3. **初始化專案**

```bash
railway init
```

4. **部署**

```bash
railway up
```

5. **設定環境變數**

```bash
railway variables set DATABASE_URL="your-database-url"
railway variables set JWT_SECRET="your-jwt-secret"
# ... 設定其他環境變數
```

### Render

1. 前往 [Render Dashboard](https://dashboard.render.com/)
2. 點擊 "New +" → "Web Service"
3. 連接您的 GitHub Repository
4. 設定：
   - **Name**: rental-property-aggregator
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node dist/index.js`
5. 在 "Environment" 頁籤新增所有環境變數
6. 點擊 "Create Web Service"

### Heroku

1. **安裝 Heroku CLI**

```bash
npm install -g heroku
```

2. **登入 Heroku**

```bash
heroku login
```

3. **建立應用程式**

```bash
heroku create rental-property-aggregator
```

4. **設定環境變數**

```bash
heroku config:set DATABASE_URL="your-database-url"
heroku config:set JWT_SECRET="your-jwt-secret"
# ... 設定其他環境變數
```

5. **部署**

```bash
git push heroku main
```

## 資料庫設定

### 使用 MySQL

1. **建立資料庫**

```sql
CREATE DATABASE rental_properties CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **建立使用者**

```sql
CREATE USER 'rental_user'@'%' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON rental_properties.* TO 'rental_user'@'%';
FLUSH PRIVILEGES;
```

3. **設定連接字串**

```
DATABASE_URL=mysql://rental_user:your-password@localhost:3306/rental_properties
```

### 使用 TiDB Cloud

1. 前往 [TiDB Cloud](https://tidbcloud.com/)
2. 建立新的 Cluster
3. 取得連接字串
4. 設定 `DATABASE_URL` 環境變數

### 執行 Migration

部署後，執行以下指令初始化資料庫結構：

```bash
pnpm db:push
```

## 生產環境最佳實踐

### 安全性

1. **使用強密碼**：確保 `JWT_SECRET` 和資料庫密碼足夠複雜
2. **HTTPS**：在生產環境中使用 HTTPS
3. **環境變數**：不要將敏感資訊提交到 Git
4. **定期更新**：保持依賴套件為最新版本

### 效能優化

1. **啟用快取**：考慮使用 Redis 快取查詢結果
2. **資料庫索引**：為常用查詢欄位建立索引
3. **CDN**：使用 CDN 加速靜態資源載入
4. **監控**：設定應用程式監控和錯誤追蹤

### 備份

1. **資料庫備份**：定期備份資料庫
2. **程式碼備份**：使用 Git 進行版本控制

## 常見問題

### Q: 部署後無法連接資料庫

**A:** 檢查以下項目：
- `DATABASE_URL` 是否正確設定
- 資料庫伺服器是否允許遠端連接
- 防火牆設定是否正確
- SSL/TLS 設定（某些雲端資料庫需要）

### Q: OAuth 登入失敗

**A:** 確認：
- `VITE_APP_ID` 是否正確
- `OAUTH_SERVER_URL` 和 `VITE_OAUTH_PORTAL_URL` 是否正確
- OAuth 應用程式的回調 URL 是否已設定

### Q: 建置失敗

**A:** 嘗試：
- 清除快取：`pnpm store prune`
- 刪除 `node_modules` 和 `pnpm-lock.yaml`，重新安裝
- 檢查 Node.js 版本是否符合需求（22+）

### Q: 如何更新應用程式

**A:** 
```bash
git pull origin main
pnpm install
pnpm db:push  # 如果有資料庫變更
pnpm build
pm2 restart all  # 或重啟您的應用程式
```

### Q: 如何查看應用程式日誌

**A:** 
- Docker: `docker logs -f rental-aggregator`
- PM2: `pm2 logs`
- 雲端平台：查看各平台的日誌介面

## 技術支援

如有任何問題，請：
1. 查看 [README.md](./README.md)
2. 在 GitHub 開啟 Issue
3. 查看專案文件

## 更新日誌

記得在每次部署時更新版本號和變更記錄。

