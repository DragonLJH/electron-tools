import { randomStr } from "../../utils/index"
const id = randomStr(30).join("")
const processId = "Process_" + randomStr(8).join("")
const bpmnDiagramId = "BpmnDiagram_" + randomStr(8).join("")
const bpmnPlaneId = "BpmnPlane_" + randomStr(8).join("")
export const initialDiagram =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
    'id="Id_' + id + '">' +
    '<bpmn:process id="' + processId + '" isExecutable="false">' +
    '</bpmn:process>' +
    '<bpmndi:BPMNDiagram id="' + bpmnDiagramId + '">' +
    '<bpmndi:BPMNPlane id="' + bpmnPlaneId + '" bpmnElement="' + processId + '">' +
    '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
    '</bpmn:definitions>';
