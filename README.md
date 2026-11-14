# TradeDoc 本地版
无需登录，资料只保存在当前浏览器。支持手机、平板、电脑和折叠屏界面，含报价单、商业发票、销售合同、装箱单及 100 × 150 mm 快递面单。

## 使用
运行 `npm ci`、`npm run build:local`，用桌面浏览器打开 `site/index.html` 即可离线使用。也可将 `site/` 发布到任意静态托管或 GitHub Pages。所有脚本、样式、条码库已打包到 HTML 中，无需后端或网络字体。
在设置维护卖家、客户和常用条款，在产品库建立产品资料；创建单据、保存后即可预览、打印或另存 PDF。
资料存储使用当前浏览器的 localStorage，清除浏览器资料会删除记录。请定期使用设置中的「导出备份」保存 JSON 文件。导入备份会添加缺少的记录并保留本地已有记录，不会覆盖现有资料。不同网址/浏览器之间的资料不会自动同步。

## 打印
普通单据采用 A4 版式。快递面单采用 100 × 150 mm；打印时选同尺寸标签、100% 实际大小、无边距，关闭页眉页脚。面单为通用寄件标签，填写快递公司提供的已有运单号并生成 CODE128 条码，未接入官方取号或路由面单。实际纸张、走纸与扫码效果需在目标打印机试打确认。

## GitHub Pages
发布分支为 `cui7878/CuiAnce` 的 `tradedoc-pages`，仅发布独立静态网页，不修改原有 main 分支。若 Pages 尚未开启：进入仓库 Settings → Pages，Source 选择 Deploy from a branch，Branch 选择 tradedoc-pages，目录 / (root)，点击 Save。
当前 GitHub App 授权不允许创建新仓库或开启 Pages（Resource not accessible by integration），因此首次开启需仓库管理员手动操作。开启前不应将预期网址报告为已上线。

## 验证与源码
`npm test` 检查本地持久化、备份合并、存储失败、并发冲突、数值计算、打印内容与独立 HTML 的启动。环境缺少浏览器验收工具，真实设备布局和物理打印效果仍需验证。
`src/storage.js` 是本地存储；`src/app.js` 为界面；`src/print.js` 和 `src/shipping.js` 为单据和条码；`scripts/build-local.mjs` 生成可携带 HTML。
仓库中 `src/api.js`、`src/worker.js` 与 `db/`、`drizzle/` 为早期云版遗留实现，不会打包到本地版中。本地版没有账号、登录或服务端数据库依赖。云版原构建仍可使用 `npm run build:cloud`。
