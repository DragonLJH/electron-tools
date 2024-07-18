import ReactDOM from "react-dom";
import React from "react";
import App from '@src/app/App'; 
// 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
// 右边工具栏样式
import 'bpmn-js-properties-panel/dist/assets/element-templates.css'
import 'bpmn-js-properties-panel/dist/assets/properties-panel.css'
ReactDOM.render(<App />, document.getElementById("main"));
