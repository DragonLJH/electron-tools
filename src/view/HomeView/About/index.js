import React, { useCallback, useEffect, useMemo, useState } from "react";
import DCountdown from "@src/components/DCountdown";
import "./index.scss";
const About = () => {
  const html = `免費試用：還剩 <span style="color:#ff0">13</span> 天 | 每首歌支援轉換前 3 分鐘`;
  return (
    <>
      <div className="about">
        <DCountdown></DCountdown>
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
