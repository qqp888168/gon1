# Timely Class：可上傳 GitHub Pages 的前端網站

## 直接上線

1. 解壓縮 ZIP。
2. 將裡面的 全部 HTML、JavaScript、README.md 等檔案上傳到 GitHub 儲存庫根目錄。不要只上傳 ZIP，也不要在最外層多包一個資料夾。
3. GitHub → Settings → Pages → Source 選 **Deploy from a branch**。
4. Branch 選 **main**，資料夾選 **/(root)**，按 Save。
5. 等待部署完成，開啟 Pages 顯示的網址。

不需要 npm、Python、Spider 或 API 金鑰。可用 GitHub 專案網址（含儲存庫子路徑）。

官方設定說明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 這份檔案是什麼

依 2026-09-15 的公開頁面製作的可編輯 HTML、CSS、JavaScript 前端展示版，保留主要視覺、公開圖片與字型，並以獨立前端程式重新接上導覽、輪播、分類、搜尋、分頁及本機購物車。

它不是網站擁有者的 Nuxt 開發原始專案，也不會更改 timelyclass.com 原站。

## 內容與限制

- 首頁、課程列表、16 個課程詳情、選品列表、3 個商品詳情、文章列表、登入／註冊、忘記密碼、搜尋、聯絡與政策頁。
- 文章詳情為預覽版型，全文透過「閱讀完整文章」開啟原站。
- 登入、註冊、LINE 與付款沒有後端服務；按下相關操作會顯示說明，不會送出帳密或收款。
- 購物車只保存在目前瀏覽器；沒有真實訂單或個人會員資料。
- 媒體與內容使用此次快照，與原站後續更新不會自動同步；部分影片需原站服務。

## 如何修改

- 改首頁文字與區塊：`index.html`。
- 改其他頁面：對應頁面的 HTML，例如 `courses.html`、`courses--life-turnaround-strategy.html`。
- 改行為：`assets--site.js`。
- 改商品資料、搜尋資料與輪播：`assets--config.js`。
- `assets--boot.js` 含頁面樣式；可在其樣式物件的 `custom` 加入覆寫 CSS。
- `assets--files-*.js` 是圖片與字型資源包。可自行新增圖片檔，將 HTML 的 `data-file` 改為圖片相對路徑，並保留或改寫 `src`。使用自訂相對路徑時需考慮頁面的目錄深度。

為便於 GitHub 網頁上傳，素材合併成少量檔案，每個檔案低於 25 MB。原圖經適合網頁的尺寸與 WebP 壓縮處理，並非逐像素不變的原始圖片。

本版本所有檔案都位於根目錄，便於 GitHub 網頁一次上傳。課程詳情例如 `courses--life-turnaround-strategy.html`。
