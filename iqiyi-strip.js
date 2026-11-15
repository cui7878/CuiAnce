// 爱奇艺数据去广告 v2 · Xolny 定制（Shadowrocket http-response 脚本）
// 2026-11-16 v2：按 fmz200/wool_scripts 现行爱奇艺插件（2026-11-11 版，逐段审读）补齐标记清单：
//   首页 views_home：alias 增 qy_home_vip_opr_banner，并泛化 ad_ 前缀（ad_mobile_flow/ad_trueview 同族）
//   搜索 views_search：改按 strategy_com_id 清单过滤（原 alias 口径已不全）+ blocks 层 block_type 959 广告块
//   播放页 views_plt（新增）：删 play_ad_no_vip 视频关联广告卡
//   路由泛化：/views_home/、/views_search/ 任意版本路径（模块侧另覆盖 access.if.iqiyi.com 网关路径）
// 作用接口（cards.iqiyi.com）：首页/分类/瀑布流/搜索/播放页数据。
// 安全设计：非 JSON、超大响应、任何解析异常 → 原样返回，一个字节都不改。
(function () {
  try {
    var url = $request.url || "";
    var body = $response.body;
    if (!body || body.length > 3145728) { $done({}); return; }
    if (body.charCodeAt(0) !== 123) { $done({}); return; }
    var obj = JSON.parse(body);
    var changed = false;

    function isAdAlias(c, aliases) {
      if (!c) return false;
      var a = c.alias_name;
      if (typeof a !== "string") return false;
      if (aliases.indexOf(a) >= 0) return true;
      if (a.indexOf("ad_") === 0) return true; // ad_ 前缀同族广告位
      return false;
    }
    function stripCards(o, aliases) {
      if (o && Array.isArray(o.cards)) {
        var before = o.cards.length;
        o.cards = o.cards.filter(function (c) { return !isAdAlias(c, aliases); });
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

    if (url.indexOf("/views_home/") >= 0) {
      stripCards(obj, ["focus", "ad_mobile_flow", "ad_trueview", "qy_home_vip_opr_banner"]);
      stripStat(obj);
    } else if (url.indexOf("/views_category/") >= 0) {
      stripCards(obj, ["entrence_focus", "ad_trueview"]);
      stripStat(obj);
    } else if (url.indexOf("/waterfall") >= 0 && url.indexOf("/feed") >= 0) {
      pruneBlockClass(obj, 0);
      stripStat(obj);
    } else if (url.indexOf("/views_search/") >= 0) {
      // 按 strategy_com_id 过滤（fmz200 现行清单）；alias 旧口径并行保留
      var SEARCH_AD_IDS = ["ad_mobile_flow", "hot_query_bottom", "hot_query_search_top_ad",
        "search_com_related_query", "search_intent_detail_onesearch", "search_mid_text_ad",
        "search_onebox_v2", "search_small_card_ad", "search_topbanner_text", "search_vip_banner"];
      if (Array.isArray(obj.cards)) {
        var beforeS = obj.cards.length;
        obj.cards = obj.cards.filter(function (card) {
          if (card && SEARCH_AD_IDS.indexOf(card.strategy_com_id) >= 0) return false;
          if (isAdAlias(card, ["ad_trueview", "ad_mobile_flow", "search_mid_text_ad"])) return false;
          if (card && Array.isArray(card.blocks)) {
            card.blocks = card.blocks.filter(function (b) {
              if (!b || typeof b !== "object") return true;
              if ("block_name" in b) return true;
              if ("block_type" in b) return [861, 959].indexOf(b.block_type) < 0; // 959=广告
              return false;
            });
          }
          return true;
        });
        if (obj.cards.length !== beforeS) changed = true;
      }
      stripStat(obj);
    } else if (url.indexOf("/views_plt/") >= 0) {
      stripCards(obj, ["play_ad_no_vip"]);
    } else {
      $done({}); return;
    }

    if (changed) { $done({ body: JSON.stringify(obj) }); }
    else { $done({}); }
  } catch (e) {
    $done({});
  }
})();
