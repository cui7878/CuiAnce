// 爱奇艺数据去广告 · Xolny 定制（Shadowrocket http-response 脚本）
// 作用于 cards.iqiyi.com 的首页/分类/瀑布流/搜索数据接口：
//   首页 qy_home：删除 alias_name 为 focus（焦点图广告位）/ad_mobile_flow（信息流广告）/ad_trueview 的卡片
//   分类页：删除 entrence_focus/ad_trueview 卡片
//   瀑布流 feed：删除带 block_class 标记的广告块
//   搜索页：删除 ad_trueview/ad_mobile_flow/search_mid_text_ad 卡片
//   同时删除带 ad_str 的 base.statistics（广告统计串）
// 安全设计：非 JSON、超大响应、任何解析异常 → 原样返回，一个字节都不改。
(function () {
  try {
    var url = $request.url || "";
    var body = $response.body;
    if (!body || body.length > 3145728) { $done({}); return; }
    if (body.charCodeAt(0) !== 123) { $done({}); return; }
    var obj = JSON.parse(body);
    var changed = false;

    function stripCards(o, aliases) {
      if (o && Array.isArray(o.cards)) {
        var before = o.cards.length;
        o.cards = o.cards.filter(function (c) {
          return !(c && aliases.indexOf(c.alias_name) >= 0);
        });
        if (o.cards.length !== before) changed = true;
      }
    }
    function stripStat(o) {
      if (o && o.base && o.base.statistics && o.base.statistics.ad_str) {
        delete o.base.statistics; changed = true;
      }
    }
    function pruneBlockClass(node, depth) {
      if (!node || typeof node !== "object" || depth > 12) return;
      if (Array.isArray(node)) {
        for (var i = node.length - 1; i >= 0; i--) {
          var el = node[i];
          if (el && typeof el === "object" && !Array.isArray(el) && ("block_class" in el)) {
            node.splice(i, 1); changed = true;
          } else { pruneBlockClass(el, depth + 1); }
        }
      } else {
        for (var k in node) {
          var v = node[k];
          if (v && typeof v === "object") {
            if (!Array.isArray(v) && ("block_class" in v)) { delete node[k]; changed = true; }
            else { pruneBlockClass(v, depth + 1); }
          }
        }
      }
    }

    if (url.indexOf("/views_home/3.0/qy_home") >= 0) {
      stripCards(obj, ["focus", "ad_mobile_flow", "ad_trueview"]);
      stripStat(obj);
    } else if (url.indexOf("/views_category/3.0/category_home") >= 0) {
      stripCards(obj, ["entrence_focus", "ad_trueview"]);
      stripStat(obj);
    } else if (url.indexOf("/waterfall") >= 0 && url.indexOf("/feed") >= 0) {
      pruneBlockClass(obj, 0);
      stripStat(obj);
    } else if (url.indexOf("/views_search/3.0/hot_query_search") >= 0) {
      stripCards(obj, ["ad_trueview", "ad_mobile_flow", "search_mid_text_ad"]);
      stripStat(obj);
    } else {
      $done({}); return;
    }

    if (changed) { $done({ body: JSON.stringify(obj) }); }
    else { $done({}); }
  } catch (e) {
    $done({});
  }
})();
