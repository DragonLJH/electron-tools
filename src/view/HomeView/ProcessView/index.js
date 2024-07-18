import React, { useEffect, useState, createContext } from "react";
import Bpmn from "@src/components/Bpmn/index.js";
import "./index.scss";
const PContext = createContext(null);
const ProcessView = () => {
  useEffect(() => {}, []);
  const [conditionId, setConditionId] = useState(null);
  const [bpmnView, setBpmnView] = useState(null);
  const [bpmnXml, setBpmnXml] = useState(null);
  const changeView = (state) => {};
  const saveMap = (data) => {
    const { flowId } = data;
    if (localStorage.hasOwnProperty(flowId)) {
      let item = JSON.parse(localStorage.getItem(flowId));
      localStorage.setItem(flowId, JSON.stringify([...item, data]));
    } else {
      localStorage.setItem(flowId, JSON.stringify([data]));
    }
  };
  return (
    <PContext.Provider value={{ bpmnView, changeView, saveMap }}>
      <div className="process-view">
        <Bpmn />
      </div>
    </PContext.Provider>
  );
};

export default ProcessView;
