import React from "react";

import DCountdown from "@src/components/DCountdown";
import "./index.scss";

const Countdown = () => {
  return (
    <>
      <div className="countdown">
        <DCountdown></DCountdown>
      </div>
    </>
  );
};

export default Countdown;
