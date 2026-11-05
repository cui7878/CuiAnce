// Vendored 2026-11-06 from https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/didi/didiAds.js
// EDITED (ads-only): removed three UI-pruning blocks by the original author that are NOT ads:
// homepage core nav filter, usercenter/me card filter (it hid the Safety Center entry), common/v5 section filter.
const url = $request.url;
if (!$response.body) $done({});

let obj = JSON.parse($response.body);

if (url.includes("/other/pGetSceneList")) {
  if (obj.data?.scene_list instanceof Array) {
    obj.data.scene_list = obj.data.scene_list.filter(item => item.text !== "优惠商城");
  }
  if (obj.data?.show_data instanceof Array) {
    obj.data.show_data.forEach((block) => {
      if (block.scene_ids instanceof Array) {
        block.scene_ids = block.scene_ids.filter(id => id !== "scene_coupon_mall");
      }
    });
  }
}

if (url.includes("/ota/na/yuantu/infoList")) {
  if (obj.data?.disorder_cards?.top_banner_card?.data[0]?.T === "yuentu_top_banner") {
    obj.data.disorder_cards.top_banner_card.data.splice(0, 1);
  }
}

if (url.includes("/gulfstream/passenger-center/v2/other/pInTripLayout")) {
  const namesToRemove = ["passenger_common_casper"];
  obj.data.order_components = obj.data.order_components.filter(
    component => !(component.name && namesToRemove.includes(component.name))
  );
}

$done({body: JSON.stringify(obj)});
