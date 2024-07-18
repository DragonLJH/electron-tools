import {
  assign
} from 'min-dash';
import inherits from 'inherits-browser';

import paletteProvider from 'bpmn-js/lib/features/palette/index';

/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
export default function CustomPalette(palette, create, elementFactory,
  spaceTool, lassoTool, handTool,
  globalConnect, translate) {

  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._handTool = handTool;
  this._globalConnect = globalConnect;
  this._translate = translate;

  palette.registerProvider(this);
}

CustomPalette.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate',
];


CustomPalette.prototype.getPaletteEntries = function (element) {
  var actions = {},
    create = this._create,
    elementFactory = this._elementFactory, 
    globalConnect = this._globalConnect,
    translate = this._translate;

  function createAction(type, group, className, title, options) {
    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));
      if (options) shape.businessObject.di.isExpanded = options.isExpanded;
      create.start(event, shape);
    }
    var shortType = type.replace(/^bpmn:/, '');
    return {
      group: group,
      className: className,
      title: title || translate('Create ' + shortType),
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  assign(actions, {
    'global-connect-tool': {
      group: 'tools',
      className: 'bpmn-icon-connection-multi',
      title: translate('Activate the global connect tool'),
      action: {
        click: function (event) {
          globalConnect.start(event);
        }
      }
    },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create.start-event': createAction(
      'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none'
    ),
    'create.userTask': createAction(
      'bpmn:UserTask', 'activity', 'bpmn-icon-user-task'
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-xor'
    ),
    'create.parallel-gateway': createAction(
      'bpmn:ParallelGateway', 'gateway', 'bpmn-icon-gateway-parallel'
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none'
    ),
  });

  return actions;
};
