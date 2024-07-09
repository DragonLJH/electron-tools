import React, { useEffect, useState } from "react";
import { fd } from "./index";

export const useMouseCoordinates = () => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const coordinatesFd = fd((x, y) => {
      setCoordinates({ x, y });
    }, 50);
    document.addEventListener("mousemove", (e) => {
      const { clientX, clientY } = e;
      coordinatesFd(clientX, clientY);
    });
  }, []);
  return { ...coordinates };
};
