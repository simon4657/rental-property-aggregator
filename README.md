# 租賃物件資訊聚合平台

一個整合多個租賃網站物件資訊的平台，提供物件搜尋、篩選與管理功能。

## 功能特色

### 🏠 物件管理
- 完整的物件資料管理（新增、編輯、刪除）
- 支援多種物件屬性：地址、價格、房間數、屋齡、電梯、捷運等
- 物件來源追蹤

### 🔍 進階搜尋與篩選
- 縣市與行政區聯動篩選
- 租金價格區間篩選
- 關鍵字搜尋（地址、行政區、捷運站）
- 即時搜尋結果更新

### 📊 資料匯入
- CSV 批量匯入功能
- 提供 CSV 範本下載
- 匯入結果詳細報告
- 自動檢測重複物件

### 🕷️ 爬蟲框架
- 可擴展的爬蟲架構
- 支援多個資料來源（591、信義、永慶）
- 防重複機制
- 爬蟲執行狀態追蹤

### 🔐 使用者認證
- Manus OAuth 整合
- 角色權限管理（管理員/一般使用者）
- 安全的 Session 管理

## 技術架構

### 前端
- **React 19** - 現代化的 UI 框架
- **TypeScript** - 型別安全
- **Tailwind CSS 4** - 實用優先的 CSS 框架
- **shadcn/ui** - 高品質 UI 元件
- **tRPC** - 端到端型別安全的 API
- **Wouter** - 輕量級路由

### 後端
- **Node.js** - JavaScript 執行環境
- **Express 4** - Web 應用框架
- **tRPC 11** - 型別安全的 RPC 框架
- **Drizzle ORM** - 輕量級 ORM

### 資料庫
- **MySQL/TiDB** - 關聯式資料庫

### 部署
- **Docker** - 容器化部署
- **GitHub** - 版本控制與 CI/CD

## 快速開始

### 環境需求
- Node.js 22+
- pnpm
- MySQL 或 TiDB 資料庫

### 安裝步驟

1. **克隆專案**
```bash
git clone <repository-url>
cd rental-property-aggregator
```

2. **安裝依賴**
```bash
pnpm install
```

3. **設定環境變數**

系統會自動注入以下環境變數：
- `DATABASE_URL` - 資料庫連接字串
- `JWT_SECRET` - Session 加密金鑰
- `VITE_APP_ID` - OAuth 應用 ID
- `OAUTH_SERVER_URL` - OAuth 伺服器 URL
- `VITE_OAUTH_PORTAL_URL` - OAuth 登入頁面 URL
- 其他系統環境變數...

4. **初始化資料庫**
```bash
pnpm db:push
```

5. **啟動開發伺服器**
```bash
pnpm dev
```

伺服器將在 `http://localhost:3000` 啟動。

### 新增測試資料

```bash
npx tsx scripts/seed-data.ts
```

## 專案結構

```
rental-property-aggregator/
├── client/                 # 前端程式碼
│   ├── public/            # 靜態資源
│   └── src/
│       ├── pages/         # 頁面元件
│       ├── components/    # UI 元件
│       ├── lib/           # 工具函式
│       └── App.tsx        # 主應用程式
├── server/                # 後端程式碼
│   ├── db.ts             # 資料庫查詢
│   ├── routers.ts        # tRPC 路由
│   ├── scraper.ts        # 爬蟲服務
│   └── _core/            # 核心功能
├── drizzle/              # 資料庫 Schema
│   └── schema.ts
├── scripts/              # 工具腳本
│   └── seed-data.ts      # 測試資料
└── shared/               # 共用程式碼
```

## 使用說明

### 1. 瀏覽物件

訪問首頁即可瀏覽所有租賃物件。使用篩選器可以：
- 選擇縣市和行政區
- 設定租金價格範圍
- 搜尋關鍵字

### 2. 管理物件

點擊「管理後台」按鈕（需登入）：
- 新增物件：點擊「新增物件」按鈕
- 編輯物件：點擊物件列表中的編輯圖示
- 刪除物件：點擊物件列表中的刪除圖示

### 3. 匯入資料

點擊「資料抓取」按鈕（需登入）：

**CSV 匯入：**
1. 下載 CSV 範本
2. 填寫物件資料
3. 上傳或貼上 CSV 內容
4. 點擊「開始匯入」

**CSV 格式範例：**
```csv
公寓網址,地址,縣市,行政區,樓層數,租金價格,房間數,屋齡,是否有電梯,靠近捷運,來源,備註
https://example.com/1,台北市大安區復興南路一段100號,台北市,大安區,5/12,28000,2房1廳1衛,15,是,捷運大安站,591租屋網,近捷運
```

### 4. 爬蟲功能

爬蟲功能提供可擴展的框架，實際使用需要：
1. 研究目標網站的 API 或 HTML 結構
2. 在 `server/scraper.ts` 中實作具體的爬蟲邏輯
3. 處理反爬蟲機制（Cookie、User-Agent、速率限制等）

## 資料庫 Schema

### properties 表

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INT | 主鍵 |
| propertyUrl | VARCHAR(512) | 物件網址 |
| address | TEXT | 地址 |
| city | VARCHAR(64) | 縣市 |
| district | VARCHAR(64) | 行政區 |
| floor | VARCHAR(64) | 樓層 |
| price | INT | 月租金 |
| rooms | VARCHAR(64) | 房間數 |
| age | INT | 屋齡 |
| hasElevator | BOOLEAN | 是否有電梯 |
| nearMrt | VARCHAR(256) | 靠近捷運 |
| source | VARCHAR(64) | 來源 |
| notes | TEXT | 備註 |
| createdBy | INT | 建立者 |
| createdAt | TIMESTAMP | 建立時間 |
| updatedAt | TIMESTAMP | 更新時間 |

## API 文件

本專案使用 tRPC，所有 API 都是型別安全的。

### 主要 API 端點

**properties（物件管理）**
- `properties.list` - 查詢物件列表
- `properties.getById` - 取得單一物件
- `properties.create` - 新增物件
- `properties.update` - 更新物件
- `properties.delete` - 刪除物件
- `properties.getCities` - 取得所有縣市
- `properties.getDistricts` - 取得指定縣市的行政區

**scraper（爬蟲與匯入）**
- `scraper.runScraper` - 執行爬蟲
- `scraper.importCSV` - 匯入 CSV 資料

**auth（認證）**
- `auth.me` - 取得當前使用者
- `auth.logout` - 登出

## 部署

### Docker 部署

```bash
# 建立 Docker 映像
docker build -t rental-aggregator .

# 執行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  rental-aggregator
```

### GitHub 部署

1. 將程式碼推送到 GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. 設定 GitHub Actions（可選）
3. 部署到您選擇的平台（Vercel、Railway、Render 等）

## 開發指南

### 新增功能

1. **新增資料庫欄位**
   - 編輯 `drizzle/schema.ts`
   - 執行 `pnpm db:push`

2. **新增 API**
   - 在 `server/routers.ts` 新增 procedure
   - 在 `server/db.ts` 新增資料庫查詢函式

3. **新增頁面**
   - 在 `client/src/pages/` 建立新元件
   - 在 `client/src/App.tsx` 註冊路由

### 程式碼風格

- 使用 TypeScript 嚴格模式
- 遵循 ESLint 規則
- 使用 Prettier 格式化程式碼

### 測試

```bash
# 執行測試（待實作）
pnpm test
```

## 常見問題

### Q: 如何修改資料庫連接？
A: 系統環境變數 `DATABASE_URL` 會自動注入，無需手動設定。

### Q: 爬蟲為什麼沒有抓到資料？
A: 爬蟲功能是一個框架，需要根據目標網站實作具體邏輯。請參考 `server/scraper.ts` 中的註解。

### Q: 如何新增更多縣市？
A: 在 `client/src/pages/Admin.tsx` 的 `taiwanCities` 陣列中新增即可。

### Q: 如何自訂 UI 主題？
A: 編輯 `client/src/index.css` 中的 CSS 變數。

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 聯絡方式

如有問題或建議，請開啟 Issue。

