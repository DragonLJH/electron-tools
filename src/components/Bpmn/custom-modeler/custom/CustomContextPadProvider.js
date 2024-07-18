import inherits from 'inherits-browser';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import {
  assign,
  bind
} from 'min-dash';



export default function CustomContextPadProvider(injector, connect, translate) {

  injector.invoke(ContextPadProvider, this);
  var cached = bind(this.getContextPadEntries, this);

  this.getContextPadEntries = function (element) {
    var elementFactory = this._elementFactory,
      connect = this._connect,
      create = this._create,
      autoPlace = this._autoPlace,
      translate = this._translate,
      appendPreview = this._appendPreview;
    const { type } = element

    /**
    * Create an append action.
    *
    * @param {string} type
    * @param {string} className
    * @param {string} [title]
    * @param {Object} [options]
    *
    * @return {ContextPadEntry}
    */
    function appendAction(type, className, title, options) {

      if (typeof title !== 'string') {
        options = title;
        title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
      }

      function appendStart(event, element) {

        var shape = elementFactory.createShape(assign({ type: type }, options));

        create.start(event, shape, {
          source: element
        });

        appendPreview.cleanUp();
      }

      var append = autoPlace ? function (_, element) {
        var shape = elementFactory.createShape(assign({ type: type }, options));

        autoPlace.append(element, shape);

        appendPreview.cleanUp();
      } : appendStart;

      var previewAppend = autoPlace ? function (_, element) {

        // mouseover
        appendPreview.create(element, type, options);

        return () => {

          // mouseout
          appendPreview.cleanUp();
        };
      } : null;

      return {
        group: 'model',
        className: className,
        title: title,
        action: {
          dragstart: appendStart,
          click: append,
          hover: previewAppend
        }
      };
    }

    var actions = cached(element);



    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }


    const actionsFilter = (filterList, targetObject, o = {}) => {
      // 添加 自定义 pad 面板
      assign(targetObject, {
        // 并行网关
        'append.parallel-gateway': appendAction(
          'bpmn:ParallelGateway',
          'bpmn-icon-gateway-parallel',
          translate('Append ParallelGateway')
        ),
        // 办理用户节点
        'append.append-task': appendAction(
          'bpmn:UserTask',
          'bpmn-icon-user-task',
          translate('Append UserTask')
        ),
      });
      filterList.forEach(item => o[item] = targetObject[item])
      return { ...o }
    }

    const commonActions = ["connect", "delete"]
    const addPrefix = (list, prefix = "append.") => list.map(item => prefix + item)

    const o = {
      "bpmn:StartEvent": [...addPrefix(["append-task", "end-event", "gateway", "parallel-gateway"]), ...commonActions],
      "bpmn:UserTask": [...addPrefix(["append-task", "end-event", "gateway", "parallel-gateway"]), ...commonActions],
      "bpmn:ExclusiveGateway": [...addPrefix(["append-task", "end-event", "gateway", "parallel-gateway"]), ...commonActions],
      "bpmn:ParallelGateway": [...addPrefix(["append-task", "end-event", "gateway", "parallel-gateway"]), ...commonActions],
      "bpmn:EndEvent": [...commonActions],
      "bpmn:SequenceFlow": ["delete"],
    }




    // 根据类型 自定义 显示面板
    return Object.hasOwn(o, type) ? actionsFilter(o[type], actions) : actions;
  };
}

inherits(CustomContextPadProvider, ContextPadProvider);

CustomContextPadProvider.$inject = [
  'injector',
  'connect',
  'translate'
];