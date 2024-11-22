import React, { useEffect, useRef, useState, forwardRef } from "react";
import "./index.scss";

const ItemDiv = forwardRef((props, ref) => {
  const { cName } = props;
  return (
    <div ref={ref} className={cName}>
      ItemDiv:{cName}
    </div>
  );
});
const Home = () => {
  useEffect(() => {}, []);
  const [target, setTarget] = useState(0);
  const aRef = useRef(null);
  useEffect(() => {
    console.log("==========", aRef);
  }, [aRef.current]);
  return (
    <>
      <div className="home">
        {new Array(5)
          .fill(null)
          .filter((_, index) => target == index)
          .map((_, index) => {
            return (
              <ItemDiv ref={aRef} key={index} cName={`home-${index + 1}`} />
            );
          })}
        <button onClick={() => setTarget(target + 1)}>+1</button>
      </div>
    </>
  );
};

export default Home;
