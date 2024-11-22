var id = 0;

export const getID = () => {
  return id++;
};

// 随机字符
export const randomStr = (length) => {
  let str = Math.random().toString(36).slice(2);
  if (str.length < length) {
    // 如果生成的随机字符串长度小于需求长度，递归调用自身来补充
    return str + randomStr(length - str.length);
  } else {
    return str.slice(0, length);
  }
};
// 随机颜色
export const randomColor = () => "#" + Math.random().toString(16).slice(2, 8);
// 验证码 画板
export const codeCanvas = (el, num = 4) => {
  var str = randomStr(num);
  var ctx = el.getContext("2d");
  ctx.fillStyle = randomColor();
  ctx.fillRect(0, 0, 25 * num, 30);
  ctx.font = "30px Arial";
  console.log("codeCanvas", str);
  str.split("").forEach((item, index) => {
    ctx.fillStyle = randomColor();
    ctx.fillText(item, 16 * (index + 1), 25);
  });
  return str;
};

// 防抖
export const debounce = (fn, delay = 500) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
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

// 将字符串转换成xml对象
export const stringToXML = (xmlString) => {
  let parser = new DOMParser();
  let xmlObject = parser.parseFromString(xmlString, "text/xml");
  return xmlObject;
};
