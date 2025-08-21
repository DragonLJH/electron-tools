import React, { useEffect, useRef, useState, forwardRef } from "react";
import Bpmn from "@src/components/Bpmn";
import "./index.scss";
const Home = () => {
  useEffect(() => {
  }, []);
  return (
    <>
      <div className="home">
        <Bpmn />
      </div>
    </>
  );
};

export default Home;
