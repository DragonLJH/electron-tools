import React, { useEffect, useRef, useState, forwardRef, useMemo } from "react";
import "./index.scss";
import CustomModeler from './help/CustomModeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import { initialDiagram } from './help/xmlStr'
import CustomPropertiesPanelModule from './help/CustomPropertiesPanel'
import { useSelector } from "react-redux";
const FlowMain = (props) => {
  const { ipcCreateWin } = props;
  const modelerRef = useRef(null), propertiesRef = useRef(null)
  const [modeler, setModeler] = useState(null);
  const _eventBus = useMemo(() => {
    if (modeler?.get('eventBus')) return modeler.get('eventBus')
    return null
  }, [modeler])
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
  const changeBusiness = (business) => {
    _eventBus.fire('root.updateBusiness', { $attrs: business })
  }
  return (
    <div className="flow-main">
      <div className="flow-main-top">
        <button onClick={() => changeBusiness({ a: '123', b: '456', c: '789' })}>check</button>
        <button onClick={() =>
          ipcCreateWin({ name: "ReviewWin" })}>ReviewWin</button>
      </div>
      <div className="canvas" ref={modelerRef}></div>
      <div className="properties" ref={propertiesRef}></div>
    </div >
  );
};

export default FlowMain;
