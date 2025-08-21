import React, { useEffect, useRef, useState, forwardRef } from "react";
import "./index.scss";
import CustomModeler from './help/CustomModeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import { initialDiagram } from './help/xmlStr'
import CustomPropertiesPanelModule from './help/CustomPropertiesPanel'
import { useSelector } from "react-redux";
const FlowMain = () => {
  const modelerRef = useRef(null), propertiesRef = useRef(null)
  const [modeler, setModeler] = useState(null);
  useEffect(() => {
    if (modelerRef?.current && !modeler) {
      const newModeler = new CustomModeler({
        container: modelerRef.current,
        propertiesPanel: {
          parent: propertiesRef.current,
        },
        additionalModules: [
          CustomPropertiesPanelModule
          // BpmnPropertiesPanelModule,
          // BpmnPropertiesProviderModule
        ]
      });
      // newModeler.importXML(initialDiagram)
      setModeler(newModeler);
    }
  }, [modelerRef.current]);
  useEffect(() => {
    console.log('[FlowMain]', modeler?.get("moddle"));
  })
  return (
    <div className="flow-main">
      <div className="canvas" ref={modelerRef}></div>
      <div className="properties" ref={propertiesRef}></div>
    </div>
  );
};

export default FlowMain;
