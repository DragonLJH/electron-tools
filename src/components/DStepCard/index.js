import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useMemo,
} from "react";
import "./index.scss";
// const MyContext = createContext();
// status?: 'wait' | 'process' | 'finish' | 'error';
export const DStepCard = (props) => {
  const { w, h, stepList, children } = props;
  const providerStyle = { "--w": `${w ?? 300}px`, "--h": `${h ?? 220}px` };
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const handleClick = (res) => {
    if (res === "prev") setActiveStepIndex(activeStepIndex - 1);
    if (res === "next") setActiveStepIndex(activeStepIndex + 1);
  };

  // 克隆每个子元素并添加点击事件和自定义属性
  const clonedChildren = React.Children.map(children, (child, index) => {
    return React.cloneElement(child, {
      handleClick,
      stepIndex: index,
      activeStepIndex,
      status: stepList?.[index]?.status,
    });
  });

  const stepBar = useMemo(() => {
    return stepList.map((item, index) => {
      return (
        <div
          className={`${item.status} item`}
          key={index}
          onClick={() => setActiveStepIndex(index)}
        >
          <span>{item.title}</span>
        </div>
      );
    });
  }, [stepList, activeStepIndex]);

  useEffect(() => {
    console.log("DStepCard stepList", stepList);
  }, []);
  return (
    // <MyContext.Provider value={{ activeStepIndex }}>
    <div className="d-step-card" style={providerStyle}>
      <div className="step-bar">{stepBar}</div>
      <div className="step-main">{clonedChildren}</div>
    </div>
    // </MyContext.Provider>
  );
};

export const DStepCardItem = (props) => {
  // const { activeStepIndex } = useContext(MyContext);
  const { children, stepIndex, activeStepIndex, status, handleClick } = props;
  
  useEffect(() => {
    console.log("DStepCardItem activeStepIndex", activeStepIndex, status);
  }, [activeStepIndex]);
  return (
    stepIndex === activeStepIndex && (
      <div className={`d-step-card-item ${status ?? ""}`}>
        <div className="step-mask"></div>
        <div className="step-title"></div>
        <div className="step-content">{children}</div>
        <div className="step-footer">
          {["finish", "process"].includes(status) && Boolean(stepIndex) && (
            <div className="btn prev" onClick={() => handleClick("prev")}>
              上一步
            </div>
          )}
          {status === "finish" && (
            <>
              <div className="btn next" onClick={() => handleClick("next")}>
                下一步
              </div>
            </>
          )}
        </div>
      </div>
    )
  );
};
