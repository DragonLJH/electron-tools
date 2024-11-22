import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./index.scss";
const About = () => {
  let animationFrameId;
  let lastTimestamp = 0; // 记录上次输出的时间
  const outputInterval = 1000; // 设置输出的时间间隔（毫秒）
  const [countdown, setCountdown] = useState(null);
  const [maskVisible, setMaskVisible] = useState(false);
  const html = `免費試用：還剩 <span style="color:#ff0">13</span> 天 | 每首歌支援轉換前 3 分鐘`;
  const animate = (timestamp) => {
    let _countdown;
    setCountdown((pre) => {
      _countdown = pre;
      return pre;
    });
    if (_countdown <= 60 * 1000) {
      cancelAnimationFrame(animationFrameId);
      return;
    }
    if (timestamp - lastTimestamp >= outputInterval) {
      setCountdown((pre) => {
        return pre - 1000;
      });
      lastTimestamp = timestamp; // 更新上次输出时间
    }
    animationFrameId = requestAnimationFrame(animate); // 请求下一帧
  };

  const countdownFormat = useMemo(() => {
    const DAYS = Math.floor(countdown / (24 * 60 * 60 * 1000));
    const _days = countdown % (24 * 60 * 60 * 1000);
    // console.log("[countdown DAYS]", DAYS);
    const HOURS = Math.floor(_days / (60 * 60 * 1000));
    const _hours = _days % (60 * 60 * 1000);
    // console.log("[countdown HOURS]", HOURS);
    const MINUTES = Math.floor(_hours / (60 * 1000));
    const _minutes = _hours % (60 * 1000);
    // console.log("[countdown MINUTES]", MINUTES);
    const SECOND = Math.floor(_minutes / 1000);
    // console.log("[countdown SECOND]", SECOND);
    return { DAYS, HOURS, MINUTES, SECOND };
  }, [countdown]);
  const requestCountdown = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let random = Math.floor(Math.random() * 10);
        let res = (5 * 24 + random) * 60 * 60 * 1000;
        console.log("[requestCountdown]", random);
        resolve(res);
      }, 3000);
    });
  };
  const countdownFn = async () => {
    setMaskVisible(() => true);
    await requestCountdown().then((countdown) => {
      setCountdown(countdown);
      animationFrameId = requestAnimationFrame(animate);
      setMaskVisible(() => false);
    });
  };
  useEffect(() => {
    countdownFn();
    // 监听可见性变化事件
    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState === "visible") {
        countdownFn();
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    });
  }, []);
  useEffect(() => {
    animationFrameId = requestAnimationFrame(animate); // 开始动画
    return () => {
      cancelAnimationFrame(animationFrameId); // 组件卸载时取消动画
    };
  }, []);
  return (
    <>
      <div className="about">
        <div className={`countdown customize bf-box `}>
          {maskVisible && <DMask></DMask>}
          <div className="customize-drop t l"></div>
          <div className="customize-drop t r"></div>
          <div className="customize-drop b l"></div>
          <div className="customize-drop b r"></div>

          {Object.entries(countdownFormat).length &&
            Object.entries(countdownFormat).map(([key, value], index) => {
              return (
                <>
                  {Boolean(index) && (
                    <div className="customize-separator"></div>
                  )}
                  <div key={key} className="days bg" data-text={key}>
                    {`${value}`.padStart(2, "0")}
                  </div>
                </>
              );
            })}
        </div>
        <div className="promotion-title">BlACK FRIDAY  SPECIALS</div>
        <DivInnerHtml html={html}></DivInnerHtml>
      </div>
    </>
  );
};

const DivInnerHtml = ({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
};

Date.prototype.format = function (format) {
  return format.replace(/(YYYY)|(MM)|(DD)|(HH)|(mm)|(ss)/g, (match) => {
    switch (match[0]) {
      case "Y":
        return String(this.getFullYear()).slice(-match.length);
      case "M":
        return String(this.getMonth() + 1).padStart(match.length, "0");
      case "D":
        return String(this.getDate()).padStart(match.length, "0");
      case "H":
        return String(this.getHours()).padStart(match.length, "0");
      case "m":
        return String(this.getMinutes()).padStart(match.length, "0");
      case "s":
        return String(this.getSeconds()).padStart(match.length, "0");
      default:
        return match;
    }
  });
};
export default About;

const DMask = (props) => {
  return (
    <div className="d-mask">
      <div className="loader"></div>
    </div>
  );
};
