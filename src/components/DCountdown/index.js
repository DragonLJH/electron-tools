import "./index.scss";
import React, { useEffect, useState, useMemo, Fragment } from "react";

const DCountdown = (props) => {
  const {
    format = "DHMS",
    countdownTime = 24 * 60 * 60 * 1000 + 3 * 1000,
    children,
  } = props;
  let animationFrameId;
  let lastTimestamp = 0; // 记录上次输出的时间
  const outputInterval = 1000; // 设置输出的时间间隔（毫秒）
  const [countdown, setCountdown] = useState(0);
  const [maskVisible, setMaskVisible] = useState(false);
  const animate = (timestamp) => {
    let _countdown;
    setCountdown((pre) => {
      _countdown = pre;
      return pre;
    });

    if (
      (!format.includes("S") && _countdown < 60 * 1000) ||
      _countdown < 1000
    ) {
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
    const factor = {
      D: 24 * 60 * 60 * 1000,
      H: 60 * 60 * 1000,
      M: 60 * 1000,
      S: 1000,
    };

    // 计算天、小时、分钟和秒
    const days = Math.floor(countdown / factor["D"]);
    const _days = countdown % factor["D"];
    const hours = Math.floor(_days / factor["H"]);
    const _hours = _days % factor["H"];
    const minutes = Math.floor(_hours / factor["M"]);
    const _minutes = _hours % factor["M"];
    const seconds = Math.floor(_minutes / factor["S"]);

    // 定义一个生成状态的通用函数
    const createTimeUnit = (time, nextValue, isActive) => ({
      time,
      active: isActive,
      nextValue,
    });

    return format.split("").reduce((acc, cur) => {
      switch (cur) {
        case "D":
          acc.days = createTimeUnit(days, days > 0 ? days - 1 : 0, !_days);
          break;
        case "H":
          acc.hours = createTimeUnit(
            hours,
            hours > 0 ? hours - 1 : countdown / factor["H"] > 23 ? 23 : 0,
            !_hours
          );
          break;
        case "M":
          acc.minutes = createTimeUnit(
            minutes,
            minutes > 0 ? minutes - 1 : countdown / factor["M"] > 59 ? 59 : 0,
            !_minutes
          );
          break;
        case "S":
          acc.seconds = createTimeUnit(
            seconds,
            seconds > 0 ? seconds - 1 : countdown / factor["S"] > 59 ? 59 : 0,
            true
          );
          break;
        default:
          break;
      }
      return acc;
    }, {});
  }, [countdown, format]);

  const requestCountdown = () => {
    return new Promise((resolve) => {
      resolve(countdownTime);
    });
  };
  const countdownFn = async () => {
    setMaskVisible(() => true);
    await requestCountdown().then((countdown) => {
      if (!countdown) return;
      setCountdown(countdown);
      animationFrameId = requestAnimationFrame(animate);
      setMaskVisible(() => false);
    });
  };
  const visibleFn = () => {
    if (document.visibilityState === "visible") {
      countdownFn();
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  };
  useEffect(() => {
    countdownFn();
    // 监听可见性变化事件
    document.addEventListener("visibilitychange", visibleFn);
    return () => {
      document.removeEventListener("visibilitychange", visibleFn);
      cancelAnimationFrame(animationFrameId); // 组件卸载时取消动画
    };
  }, []);
  return (
    <div className="d-countdown">
      {children}
      <div className="wrapper">
        {maskVisible && <DMask></DMask>}
        {Object.entries(countdownFormat).length &&
          Object.entries(countdownFormat).map(([key, value], index) => {
            return (
              <Fragment key={`${key}-fragment`}>
                <div className="bg" data-text={key}>
                  {`${value.time}`.padStart(2, "0")}
                </div>
              </Fragment>
            );
          })}
      </div>

      <div className="wrapper">
        {Object.entries(countdownFormat).length &&
          Object.entries(countdownFormat).map(([key, value], index) => {
            return (
              <Flipping
                key={`bg-${key}-${value.time}`}
                active={value.active}
                value={value.time.toString().padStart(2, "0")}
                nextValue={value.nextValue.toString().padStart(2, "0")}
              />
            );
          })}
      </div>
    </div>
  );
};

const Flipping = (props) => {
  const { value, nextValue, active } = props;
  return (
    <div
      className={`flipping-box ${active ? "flipping" : ""}`}
      style={{ "--b-c1": "#ccc", "--b-c2": "#eee" }}
    >
      <div className="item">{nextValue}</div>
      <div className="item">{nextValue}</div>
      <div className="item">{value}</div>
      <div className="item">{value}</div>
    </div>
  );
};
const DMask = (props) => {
  return (
    <div className="d-mask">
      <div className="loader"></div>
    </div>
  );
};
export default DCountdown;
