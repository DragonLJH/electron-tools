import React, { useEffect, useState } from "react";
import AppTop from "@src/app/app-top/index";
import "./app.css";
import MyRouter, { routeComponents } from "@src/route/index";
const App = () => {
  useEffect(() => {}, []);
  return (
    <>
      <MyRouter>
        <AppTop></AppTop>
      </MyRouter>
    </>
  );
};

export default App;
