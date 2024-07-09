var str = "abcdefghijkmnpqrstuvwxyABCDEFGHIJLMNOPQRSTUVWXYZ123456789";
// 随机字符
export const randomStr = (num) => {
  let res = new Array(num).fill(null).map((_) => {
    let index = Math.round(Math.random() * (str.length - 1));
    return str[index];
  });
  return res;
};
// 随机颜色
export const randomColor = () => {
  return "#" + Math.random().toString(16).slice(2, 8);
};
// 验证码 画板
export const codeCanvas = (el, num = 4) => {
  var str = randomStr(num);
  var ctx = el.getContext("2d");
  ctx.fillStyle = randomColor();
  ctx.fillRect(0, 0, 25 * num, 30);
  ctx.font = "30px Arial";
  str.forEach((item, index) => {
    ctx.fillStyle = randomColor();
    ctx.fillText(item, 16 * (index + 1), 25);
  });
  return str.join("");
};

// 防抖
export const fd = (fn, d = 1000) => {
  let timer;
  return (...data) => {
    if (timer) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...data);
      }, d);
      return;
    }
    timer = setTimeout(() => {
      fn(...data);
    }, d);
  };
};
export const mergeObj = (m1, m2) => {
  const res = { ...m1 };
  Object.entries(m2).forEach(([k, v]) => {
    if (
      Object.prototype.toString.call(v) === "[object Object]" &&
      Object.prototype.toString.call(res[k]) === "[object Object]"
    ) {
      res[k] = mergeObj(m1[k], v);
    } else {
      res[k] = v;
    }
  });
  return res;
};


