import Modeler from 'bpmn-js/lib/Modeler';

import {
  assign,
  isArray
} from 'min-dash';

import inherits from 'inherits-browser';

import CustomModule from './custom';

import { initialDiagram } from '../xmlStr';


export default function CustomModeler(options) {
  Modeler.call(this, options);
  console.log("CustomModeler", this)
  this._customElements = [];
}

inherits(CustomModeler, Modeler);

// CustomModeler.prototype._modules = [].concat(
//   CustomModeler.prototype._modules, [CustomModule]
// );
CustomModeler.prototype._modules = [].concat(
  CustomModeler.prototype._modules, [CustomModule]
);


CustomModeler.prototype._importXML = async function _importXML(xml) {
  if (xml) return this.importXML(xml);
  return this.importXML(initialDiagram);
}




/**
 * Add a single custom element to the underlying diagram
 * 将单个自定义元素添加到基础关系图
 * @param {Object} customElement
 */
// CustomModeler.prototype._addCustomShape = function (customElement) {

//   this._customElements.push(customElement);

//   var canvas = this.get('canvas'),
//     elementFactory = this.get('elementFactory');

//   var customAttrs = assign({ businessObject: customElement }, customElement);

//   var customShape = elementFactory.create('shape', customAttrs);

//   return canvas.addShape(customShape);

// };

// CustomModeler.prototype._addCustomConnection = function (customElement) {

//   this._customElements.push(customElement);

//   var canvas = this.get('canvas'),
//     elementFactory = this.get('elementFactory'),
//     elementRegistry = this.get('elementRegistry');

//   var customAttrs = assign({ businessObject: customElement }, customElement);

//   var connection = elementFactory.create('connection', assign(customAttrs, {
//     source: elementRegistry.get(customElement.source),
//     target: elementRegistry.get(customElement.target)
//   }),
//     elementRegistry.get(customElement.source).parent);

//   return canvas.addConnection(connection);

// };

/**
 * Add a number of custom elements and connections to the underlying diagram.
 * 向基础关系图中添加一些自定义元素和连接。
 * @param {Array<Object>} customElements
 */
// CustomModeler.prototype.addCustomElements = function (customElements) {

//   if (!isArray(customElements)) {
//     throw new Error('argument must be an array');
//   }

//   var shapes = [],
//     connections = [];

//   customElements.forEach(function (customElement) {
//     if (isCustomConnection(customElement)) {
//       connections.push(customElement);
//     } else {
//       shapes.push(customElement);
//     }
//   });

//   // add shapes before connections so that connections
//   // 在连接之前添加形状，以便连接
//   // can already rely on the shapes being part of the diagram
//   // 可以依赖于作为图表一部分的形状
//   shapes.forEach(this._addCustomShape, this);

//   connections.forEach(this._addCustomConnection, this);
// };

/**
 * Get custom elements with their current status.
 * 获取具有当前状态的自定义元素。
 * @return {Array<Object>} custom elements on the diagram
 */
// CustomModeler.prototype.getCustomElements = function () {
//   return this._customElements;
// };


// function isCustomConnection(element) {
//   return element.type === 'custom:connection';
// }
