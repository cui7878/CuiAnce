// 小红书开屏去广告 · Xolny 定制（Shadowrocket http-response 脚本）
// 作用于 edith.xiaohongshu.com / edith.rnote.com 的 system_service 接口：
//   system_service/config        → 删除 data.splash（开屏广告配置块），其余配置原样保留
//   system_service/splash_config → 把每个广告组/广告的生效时间推到 2090 年，广告永不在有效期内
// 行为参考社区通行做法（fmz200），代码为自有实现。
// 安全设计：非 JSON、超大响应、任何解析异常 → 原样返回，一个字节都不改。
(function () {
  try {
    var url = $request.url || "";
    var body = $response.body;
    if (!body || body.length > 3145728) { $done({}); return; }
    if (body.charCodeAt(0) !== 123) { $done({}); return; }
    var obj = JSON.parse(body);
    var changed = false;

    var FAR_START = 3818332800; // 2090-12-31 00:00:00 UTC
    var FAR_END = 3818419199;   // 2090-12-31 23:59:59 UTC

    if (url.indexOf("/system_service/config") !== -1) {
      if (obj.data && obj.data.splash) {
        delete obj.data.splash;
        changed = true;
      }
    }

    if (url.indexOf("/system_service/splash_config") !== -1) {
      var groups = obj && obj.data && obj.data.ads_groups;
      if (Array.isArray(groups)) {
        groups.forEach(function (g) {
          if (!g) return;
          g.start_time = FAR_START;
          g.end_time = FAR_END;
          changed = true;
          if (Array.isArray(g.ads)) {
            g.ads.forEach(function (ad) {
              if (!ad) return;
              ad.start_time = FAR_START;
              ad.end_time = FAR_END;
            });
          }
        });
      }
    }

    if (changed) {
      $done({ body: JSON.stringify(obj) });
    } else {
      $done({});
    }
  } catch (e) {
    $done({});
  }
})();
