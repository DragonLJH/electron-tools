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


export const flattenTree = (data, childrenKey = 'children') => {
  const result = []
  const recurse = (nodes) => {
    for (const node of nodes) {
      if (Object.prototype.toString.call(node) === '[object Array]') {
        result.push(...node)
        continue
      }
      const { [childrenKey]: children, ...rest } = typeof node === 'object' ? node : { [childrenKey]: node }
      result.push(rest)
      if (Array.isArray(children)) {
        recurse(children)
      }
    }
  }
  recurse(data)
  console.log('[flattenTree]result', result)
  return result
}


function _createElement(attr, tagName = "div", textContent) {
  const el = document.createElement(tagName);
  const _attr = Object.entries(attr);
  if (_attr.length) {
    _attr.forEach(([key, value]) => el.setAttribute(key, value));
  }
  if (textContent) el.textContent = textContent;
  return el;
}
export function showModal({
  title = "提示",
  message = "",
  confirmText = "确定",
  cancelText = "取消",
  closeOnBackdrop = true,
} = {}) {
  // 只注入一次样式
  if (!document.getElementById("mini-modal-style")) {
    const style = document.createElement("style");
    style.id = "mini-modal-style";
    style.textContent = `
      .mm-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.45);z-index:9999}
      .mm-dialog{background:#fff;max-width:420px;width:clamp(260px,90vw,420px);border-radius:12px;
        box-shadow:0 10px 30px rgba(0,0,0,.2);overflow:hidden;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto}
      .mm-header{padding:14px 16px;border-bottom:1px solid #eee;font-weight:600}
      .mm-body{padding:16px;color:#333;white-space:pre-wrap}
      .mm-footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #f2f2f2}
      .mm-btn{appearance:none;border:1px solid #dcdcdc;background:#fff;border-radius:8px;padding:8px 14px;cursor:pointer}
      .mm-btn:focus{outline:2px solid #8ab4f8;outline-offset:2px}
      .mm-btn-primary{background:#1677ff;color:#fff;border-color:#1677ff}
    `;
    document.head.appendChild(style);
  }
  return new Promise((resolve) => {
    const [backdrop, dialog, header, body, footer, btnCancel, btnOk] = [
      {
        attributes: {
          class: "mm-backdrop",
          "aria-hidden": "true",
          "aria-modal": "true",
        },
      },
      {
        attributes: {
          class: "mm-dialog",
          tabIndex: -1,
        },
      },
      {
        attributes: { class: "mm-header" },
        textContent: title,
      },
      {
        attributes: { class: "mm-body" },
        textContent: message,
      },
      {
        attributes: { class: "mm-footer" },
      },
      {
        tagName: "button",
        attributes: { class: "mm-btn" },
        textContent: cancelText,
      },
      {
        tagName: "button",
        attributes: { class: "mm-btn mm-btn-primary" },
        textContent: confirmText,
      },
    ].map(({ attributes, tagName, textContent }) =>
      _createElement(attributes, tagName, textContent)
    );
    footer.append(btnCancel, btnOk);
    dialog.append(header, body, footer);
    backdrop.append(dialog);
    document.body.appendChild(backdrop);

    // 聚焦与滚动锁
    const prevActive = document.activeElement;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => dialog.focus(), 0);

    const cleanup = (val) => {
      document.body.removeChild(backdrop);
      document.documentElement.style.overflow = prevOverflow || "";
      if (prevActive && prevActive.focus) prevActive.focus();
      resolve(val);
    };

    // 事件
    btnOk.addEventListener("click", () => cleanup(true));
    btnCancel.addEventListener("click", () => cleanup(false));

    backdrop.addEventListener("click", (e) => {
      if (!closeOnBackdrop) return;
      if (e.target === backdrop) cleanup(false);
    });

    const onKey = (e) => {
      if (e.key === "Escape") cleanup(false);
      if (e.key === "Enter") cleanup(true);
    };
    document.addEventListener("keydown", onKey, { once: true });
  });
}; 