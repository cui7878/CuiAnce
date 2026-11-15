// Bilibili splash + home-feed ad filter (Shadowrocket / Surge http-response script).
// Built 2026-11-16. Feed/splash logic derived from app2smile/rules js/bilibili-json.js
// (fetched and audited line-by-line on 2026-11-16); notifications and body logging
// removed, everything wrapped fail-open: on any anomaly the original body is
// returned untouched ($done({})), so a Bilibili API change can never blank the feed.
// Scope: x/v2/splash/list + splash/show (clear ad payload), x/v2/feed/index
// (drop ad cards: banner ads, cm_v2 ad_* cards, game cards, cm_double_v9 promo).

(function () {
  try {
    var url = $request.url || "";
    if (!$response || !$response.body) { $done({}); return; }
    var body = JSON.parse($response.body);
    if (!body || !body.data) { $done({}); return; }

    if (url.indexOf("x/v2/splash") !== -1) {
      var changed = false;
      if (body.data.show) { delete body.data.show; changed = true; }
      if (Array.isArray(body.data.list) && body.data.list.length) {
        body.data.list = [];
        changed = true;
      }
      $done(changed ? { body: JSON.stringify(body) } : {});
      return;
    }

    if (url.indexOf("x/v2/feed/index") !== -1) {
      var items = body.data.items;
      if (!Array.isArray(items)) { $done({}); return; }
      var AD_GOTOS = ["ad_web_s", "ad_av", "ad_web_gif", "ad_player", "ad_inline_3d", "ad_inline_eggs"];
      body.data.items = items.filter(function (i) {
        var cardType = i && i.card_type;
        var cardGoto = i && i.card_goto;
        if (!cardType || !cardGoto) return true;
        if (cardType === "banner_v8" && cardGoto === "banner") {
          if (Array.isArray(i.banner_item)) {
            for (var k = 0; k < i.banner_item.length; k++) {
              if (i.banner_item[k] && i.banner_item[k].type === "ad") return false;
            }
          }
          return true;
        }
        if (cardType === "cm_v2" && AD_GOTOS.indexOf(cardGoto) !== -1) return false;
        if (cardType === "small_cover_v10" && cardGoto === "game") return false;
        if (cardType === "cm_double_v9" && cardGoto === "ad_inline_av") return false;
        return true;
      });
      $done({ body: JSON.stringify(body) });
      return;
    }

    $done({});
  } catch (e) {
    $done({});
  }
})();
