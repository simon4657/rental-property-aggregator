# Render 資料庫配置指南

本指南說明如何在 Render.com 上為租賃物件聚合平台配置資料庫。

## 目錄

- [方案一：使用 Render PostgreSQL（推薦）](#方案一使用-render-postgresql推薦)
- [方案二：使用外部 MySQL 資料庫](#方案二使用外部-mysql-資料庫)
- [常見問題](#常見問題)

---

## 方案一：使用 Render PostgreSQL（推薦）

Render 提供免費的 PostgreSQL 資料庫，適合測試和小型專案使用。

### 步驟 1：建立 PostgreSQL 資料庫

1. 登入 [Render Dashboard](https://dashboard.render.com/)
2. 點擊右上角的 **New +** 按鈕
3. 選擇 **PostgreSQL**
4. 填寫資料庫資訊：
   - **Name**: `rental-property-db`（或任何您喜歡的名稱）
   - **Database**: `rental_property`
   - **User**: `rental_user`（自動生成）
   - **Region**: 選擇與您的 Web Service 相同的區域（如 Singapore）
   - **PostgreSQL Version**: 選擇最新版本
   - **Plan**: 選擇 **Free**
5. 點擊 **Create Database**

### 步驟 2：取得資料庫連線字串

1. 資料庫建立完成後，進入資料庫頁面
2. 找到 **Connections** 區塊
3. 複製 **Internal Database URL**（格式如：`postgresql://user:password@host/database`）

### 步驟 3：設定環境變數

1. 回到您的 Web Service 頁面（`rental-property-aggregator`）
2. 點擊左側選單的 **Environment**
3. 找到 `DATABASE_URL` 環境變數
4. 將值更新為剛才複製的 **Internal Database URL**
5. 點擊 **Save Changes**

### 步驟 4：修改專案以支援 PostgreSQL

**重要**：目前專案使用 MySQL，需要修改為 PostgreSQL。

1. 更新 `package.json` 的依賴：
   ```json
   {
     "dependencies": {
       "drizzle-orm": "^0.36.4",
       "postgres": "^3.4.5"  // 新增這行，移除 mysql2
     }
   }
   ```

2. 更新 `server/db.ts` 的資料庫連線：
   ```typescript
   import { drizzle } from "drizzle-orm/postgres-js";
   import postgres from "postgres";
   
   let _db: ReturnType<typeof drizzle> | null = null;
   
   export async function getDb() {
     if (!_db && process.env.DATABASE_URL) {
       try {
         const client = postgres(process.env.DATABASE_URL);
         _db = drizzle(client);
       } catch (error) {
         console.warn("[Database] Failed to connect:", error);
         _db = null;
       }
     }
     return _db;
   }
   ```

3. 更新 `drizzle/schema.ts` 從 MySQL 改為 PostgreSQL：
   ```typescript
   import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
   
   export const roleEnum = pgEnum("role", ["user", "admin"]);
   
   export const users = pgTable("users", {
     id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
     openId: varchar("openId", { length: 64 }).notNull().unique(),
     name: text("name"),
     email: varchar("email", { length: 320 }),
     loginMethod: varchar("loginMethod", { length: 64 }),
     role: roleEnum("role").default("user").notNull(),
     createdAt: timestamp("createdAt").defaultNow().notNull(),
     updatedAt: timestamp("updatedAt").defaultNow().notNull(),
     lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
   });
   
   // 其他資料表也需要類似的修改...
   ```

### 步驟 5：初始化資料庫

1. 在本地執行：
   ```bash
   pnpm db:push
   ```

2. 或者在 Render 上透過 Shell 執行：
   - 進入 Web Service 頁面
   - 點擊右上角的 **Shell**
   - 執行：
     ```bash
     pnpm db:push
     ```

### 步驟 6：重新部署

1. 推送程式碼到 GitHub：
   ```bash
   git add -A
   git commit -m "切換到 PostgreSQL 資料庫"
   git push
   ```

2. Render 會自動重新部署

---

## 方案二：使用外部 MySQL 資料庫

如果您想繼續使用 MySQL，可以使用 PlanetScale 或其他 MySQL 服務。

### 使用 PlanetScale（推薦）

1. 註冊 [PlanetScale](https://planetscale.com/)
2. 建立新資料庫
3. 取得連線字串（格式：`mysql://user:password@host/database?ssl={"rejectUnauthorized":true}`）
4. 在 Render 的環境變數中設定 `DATABASE_URL`
5. 在 PlanetScale 的控制台執行 `pnpm db:push` 來初始化 schema

### 使用其他 MySQL 服務

- **Railway**: 提供 MySQL 資料庫
- **AWS RDS**: 適合生產環境
- **DigitalOcean**: 提供 Managed MySQL

---

## 常見問題

### Q: 為什麼擴充功能顯示 "Unexpected token '<'" 錯誤？

**A**: 這是因為資料庫未配置，API 返回了 HTML 錯誤頁面而不是 JSON。配置好資料庫後問題就會解決。

### Q: 免費的 PostgreSQL 資料庫有什麼限制？

**A**: Render 免費 PostgreSQL 的限制：
- 90 天後會過期（需要重新建立）
- 1 GB 儲存空間
- 適合測試和小型專案

### Q: 如何檢查資料庫是否正常運作？

**A**: 可以透過以下方式檢查：

1. 查看 Render Web Service 的 Logs
2. 測試 API 端點：
   ```bash
   curl https://rental-property-aggregator.onrender.com/api/trpc/properties.list
   ```
3. 如果返回 JSON 而不是錯誤，表示資料庫正常

### Q: 資料庫初始化失敗怎麼辦？

**A**: 常見原因：
- 環境變數 `DATABASE_URL` 設定錯誤
- 資料庫連線字串格式不正確
- 網路連線問題

解決方法：
1. 檢查環境變數是否正確
2. 確認資料庫服務正在運行
3. 查看 Render Logs 了解詳細錯誤訊息

---

## 下一步

配置好資料庫後：

1. 測試網站前端是否能正常顯示物件列表
2. 測試瀏覽器擴充功能是否能成功儲存資料
3. 在管理後台新增測試資料

如有任何問題，請參考 [Render 官方文件](https://docs.render.com/) 或提交 Issue。

