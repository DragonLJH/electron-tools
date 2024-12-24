const md5 = require("md5-node");

function verification(...url) {
  let sp_w = "v";
  let num_p = [1, 2, 3];
  for (let i = 0; i < 3; i++) {
    sp_w = sp_w + String(num_p[i] * 2 + (5 - i));
  }
  console.log("[sp_w 1] ", sp_w);
  let spec_url = url.join("").trim();
  console.log("[spec_url] ", spec_url);
  sp_w = md5(spec_url + sp_w + "p");
  console.log("[sp_w 2] ", sp_w);
  return sp_w;
}
console.log(verification("https://music.youtube.com/watch?v=NrUlydECU-8"));
