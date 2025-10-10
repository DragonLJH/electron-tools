import {
    assign,
    forEach,
    isArray,
    every
} from 'min-dash';
import {
    hasPrimaryModifier
} from 'diagram-js/lib/util/Mouse';
import GlobalConnectModule from 'diagram-js/lib/features/global-connect';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import CustomPopupMenu from './CustomPopupMenu';
function CustomContextPadProvider(
    config, injector, eventBus,
    contextPad, modeling, elementFactory,
    connect, create, popupMenu,
    canvas, rules, translate, appendPreview) {

    config = config || {};

    contextPad.registerProvider(this);

    this._contextPad = contextPad;

    this._modeling = modeling;

    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._popupMenu = popupMenu;
    this._canvas = canvas;
    this._rules = rules;
    this._translate = translate;
    this._eventBus = eventBus;
    this._appendPreview = appendPreview;

    if (config.autoPlace !== false) {
        this._autoPlace = injector.get('autoPlace', false);
    }

    eventBus.on('create.end', 250, function (event) {
        var context = event.context,
            shape = context.shape;

        if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
            return;
        }

        var entries = contextPad.getEntries(shape);

        if (entries.replace) {
            entries.replace.action.click(event, shape);
        }
    });
}

CustomContextPadProvider.$inject = [
    'config.contextPad',
    'injector',
    'eventBus',
    'contextPad',
    'modeling',
    'elementFactory',
    'connect',
    'create',
    'popupMenu',
    'canvas',
    'rules',
    'translate',
    'appendPreview'
];

/**
 * @param {Element[]} elements
 *
 * @return {ContextPadEntries}
 */
CustomContextPadProvider.prototype.getMultiElementContextPadEntries = function (elements) {
    var modeling = this._modeling;

    var actions = {};

    if (this._isDeleteAllowed(elements)) {
        assign(actions, {
            'delete': {
                group: 'edit',
                className: 'bpmn-icon-trash',
                title: this._translate('Remove'),
                action: {
                    click: function (event, elements) {
                        modeling.removeElements(elements.slice());
                    }
                }
            }
        });
    }

    return actions;
};

/**
 * @param {Element[]} elements
 *
 * @return {boolean}
 */
CustomContextPadProvider.prototype._isDeleteAllowed = function (elements) {

    var baseAllowed = this._rules.allowed('elements.delete', {
        elements: elements
    });

    if (isArray(baseAllowed)) {
        return every(baseAllowed, function (element) {
            return includes(baseAllowed, element);
        });
    }

    return baseAllowed;
};

/**
 * @param {Element} element
 *
 * @return {ContextPadEntries}
 */
CustomContextPadProvider.prototype.getContextPadEntries = function (element) {
    var contextPad = this._contextPad,
        modeling = this._modeling,
        elementFactory = this._elementFactory,
        connect = this._connect,
        create = this._create,
        popupMenu = this._popupMenu,
        rules = this._rules,
        autoPlace = this._autoPlace,
        translate = this._translate,
        appendPreview = this._appendPreview;
    const { type } = element

    var actions = {};

    if (element.type === 'label') {
        return actions;
    }
    function removeElement(e, element) {
        modeling.removeElements([element]);
    }
    function startConnect(event, element) {
        connect.start(event, element);
    }

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

    assign(actions, {
        'append.end-event': appendAction(
            'bpmn:EndEvent',
            'bpmn-icon-end-event-none',
            translate('Append EndEvent')
        ),
        'append.gateway': appendAction(
            'bpmn:ExclusiveGateway',
            'bpmn-icon-gateway-none',
            translate('Append Gateway')
        ),
        'append.append-task': appendAction(
            'bpmn:Task',
            'bpmn-icon-task',
            translate('Append Task')
        ),
    })
    assign(actions, {
        'delete': {
            group: 'edit',
            className: 'bpmn-icon-trash',
            title: translate('Remove'),
            action: {
                click: removeElement
            }
        },
        'connect': {
            group: 'connect',
            className: 'bpmn-icon-connection-multi',
            title: translate('Connect using Association'),
            action: {
                click: startConnect,
                dragstart: startConnect,
            },
        },
    });

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
            // 'append.append-task': appendAction(
            //     'bpmn:UserTask',
            //     'bpmn-icon-user-task',
            //     translate('Append UserTask')
            // ),
        });
        filterList.forEach(item => o[item] = targetObject[item])
        return Object.assign({}, o)
    }

    const commonActions = ["connect", "delete"]
    const addPrefix = (list, prefix = "append.") => list.map(item => prefix + item)

    const o = {
        "bpmn:StartEvent": [...addPrefix(["append-task", "end-event", "gateway", "parallel-gateway"]), ...commonActions],
        "bpmn:UserTask": [...addPrefix(["append-task", "end-event", "gateway", "parallel-gateway"]), ...commonActions],
        "bpmn:ExclusiveGateway": [...addPrefix(["append-task", "end-event"]), ...commonActions],
        "bpmn:ParallelGateway": [...addPrefix(["append-task", "end-event"]), ...commonActions],
        "bpmn:EndEvent": [...commonActions],
        "bpmn:SequenceFlow": ["delete"],
    }




    // 根据类型 自定义 显示面板
    return Object.hasOwn(o, type) ? actionsFilter(o[type], actions) : actions;



    // return actions;

};


function includes(array, item) {
    return array.indexOf(item) !== -1;
}


class CustomContextPadProviderModule {
    static $inject = [
        'config.contextPad',
        'injector',
        'eventBus',
        'contextPad',
        'modeling',
        'elementFactory',
        'connect',
        'create',
        'popupMenu',
        'canvas',
        'rules',
        'translate',
        'appendPreview'
    ]
    _businessCustomOptions = {}
    constructor(config, injector, eventBus,
        contextPad, modeling, elementFactory,
        connect, create, popupMenu,
        canvas, rules, translate, appendPreview) {

        config = config || {};

        contextPad.registerProvider(this);

        this._contextPad = contextPad;

        this._modeling = modeling;

        this._elementFactory = elementFactory;
        this._connect = connect;
        this._create = create;
        this._popupMenu = popupMenu;
        this._canvas = canvas;
        this._rules = rules;
        this._translate = translate;
        this._eventBus = eventBus;
        this._appendPreview = appendPreview;

        if (config.autoPlace !== false) {
            this._autoPlace = injector.get('autoPlace', false);
        }
        console.log('[contextPad]', contextPad, this._autoPlace, popupMenu)
        eventBus.on('create.end', 250, function (event) {
            var context = event.context,
                shape = context.shape;

            if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
                return;
            }

            var entries = contextPad.getEntries(shape);

            if (entries.replace) {
                entries.replace.action.click(event, shape);
            }
        });
        eventBus.on('root.updateBusiness', e => {
            console.log('CustomContextPadProviderModule[root.updateBusiness]', e)
            const { type, ...businessObject } = e
            this._businessCustomOptions = {
                ...this._businessCustomOptions,
                ...businessObject
            }
            contextPad._init()
        })

    }

    getMultiElementContextPadEntries(elements) {
        var modeling = this._modeling;

        var actions = {};

        if (this._isDeleteAllowed(elements)) {
            assign(actions, {
                'delete': {
                    group: 'edit',
                    className: 'bpmn-icon-trash',
                    title: this._translate('Remove'),
                    action: {
                        click: function (event, elements) {
                            modeling.removeElements(elements.slice());
                        }
                    }
                }
            });
        }

        return actions;
    }
    _isDeleteAllowed(elements) {

        var baseAllowed = this._rules.allowed('elements.delete', {
            elements: elements
        });

        if (isArray(baseAllowed)) {
            return every(baseAllowed, function (element) {
                return includes(baseAllowed, element);
            });
        }

        return baseAllowed;
    };
    getContextPadEntries(element) {
        var contextPad = this._contextPad,
            modeling = this._modeling,
            elementFactory = this._elementFactory,
            connect = this._connect,
            create = this._create,
            popupMenu = this._popupMenu,
            rules = this._rules,
            autoPlace = this._autoPlace,
            translate = this._translate,
            appendPreview = this._appendPreview,
            businessCustomOptions = this._businessCustomOptions;
        const { type } = element

        var actions = {};

        if (element.type === 'label') {
            return actions;
        }
        function removeElement(e, element) {
            modeling.removeElements([element]);
        }
        function startConnect(event, element) {
            connect.start(event, element);
        }

        function _insetBusiness(set, options) {
            const _set = (options) => {
                Object.entries(options).forEach(([key, value]) => {
                    if (Object.prototype.toString.call(value) === '[object Object]') {
                        _set(value)
                    } else {
                        set(key, value)
                    }
                })
            }
            _set(options)
        }
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
            const shortType = type.replace(/^bpmn:/, '');
            if (typeof title !== 'string') {
                options = title;
                title = translate('Append {type}', { type: shortType });
            }

            function appendStart(event, element) {
                var shape = elementFactory.createShape(assign({ type: type }, options));
                console.log('[appendStart]shortType', shortType, businessCustomOptions)
                _insetBusiness((k, v) => shape.businessObject.set(k, v), businessCustomOptions)
                create.start(event, shape, {
                    source: element
                });

                appendPreview.cleanUp();
            }

            var append = autoPlace ? function (_, element) {
                var shape = elementFactory.createShape(assign({ type: type }, options));

                console.log('[append]shortType', shortType, businessCustomOptions)
                _insetBusiness((k, v) => shape.businessObject.set(k, v), businessCustomOptions)
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
        function getReplaceMenuPosition(element) {

            var Y_OFFSET = 5;

            var pad = contextPad.getPad(element).html;

            var padRect = pad.getBoundingClientRect();

            var pos = {
                x: padRect.left,
                y: padRect.bottom + Y_OFFSET
            };

            return pos;
        }
        // Replace menu entry
        assign(actions, {
            'replace': {
                group: 'edit',
                className: 'bpmn-icon-screw-wrench',
                title: translate('Change type'),
                action: {
                    click: function (event, element) {
                        var position = assign(getReplaceMenuPosition(element), {
                            cursor: { x: event.x, y: event.y }
                        });

                        popupMenu.open(element, 'bpmn-replace', position, {
                            title: translate('Change element'),
                            width: 300,
                            search: true
                        });
                    }
                }
            }
        });
        assign(actions, {
            'append.end-event': appendAction(
                'bpmn:EndEvent',
                'bpmn-icon-end-event-none',
                translate('Append EndEvent')
            ),
            'append.gateway': appendAction(
                'bpmn:ExclusiveGateway',
                'bpmn-icon-gateway-none',
                translate('Append Gateway')
            ),
            'append.exclusive-gateway': appendAction(
                'bpmn:ExclusiveGateway',
                'bpmn-icon-gateway-xor',
                translate('Append Gateway')
            ),
            'append.parallel-gateway': appendAction(
                'bpmn:ParallelGateway',
                'bpmn-icon-gateway-parallel',
                translate('Append ParallelGateway')
            ),
            'append.append-task': appendAction(
                'bpmn:UserTask',
                'bpmn-icon-user-task',
                translate('Append UserTask')
            ),
            'append.receive-task': appendAction(
                'bpmn:ReceiveTask',
                'bpmn-icon-receive-task',
                translate('Append ReceiveTask')
            ),
        })
        assign(actions, {
            'delete': {
                group: 'edit',
                className: 'bpmn-icon-trash',
                title: translate('Remove'),
                action: {
                    click: removeElement
                }
            },
            'connect': {
                group: 'connect',
                className: 'bpmn-icon-connection-multi',
                title: translate('Connect using Association'),
                action: {
                    click: startConnect,
                    dragstart: startConnect,
                },
            },
        });

        const actionsFilter = (filterList, targetObject, o = {}) => {
            filterList.forEach(item => o[item] = targetObject[item])
            return Object.assign({}, o)
        }

        const commonActions = ["connect", "delete"]
        const addPrefix = (list, prefix = "append.") => list.map(item => prefix + item)

        const o = {
            "bpmn:StartEvent": [...addPrefix(["append-task", "end-event", "exclusive-gateway", "parallel-gateway"]), ...commonActions],
            "bpmn:UserTask": [...addPrefix(["append-task", "end-event", "exclusive-gateway", "parallel-gateway"]), ...commonActions],
            "bpmn:ExclusiveGateway": [...addPrefix(["append-task", "end-event"]), ...commonActions],
            "bpmn:ParallelGateway": [...addPrefix(["append-task", "end-event"]), ...commonActions],
            "bpmn:EndEvent": [...commonActions],
            "bpmn:SequenceFlow": ["delete"],
        }




        // 根据类型 自定义 显示面板
        return Object.hasOwn(o, type) ? actionsFilter(o[type], actions) : actions;



        // return actions;

    };

}

export default {
    __init__: [
        'contextPadProvider',
    ],
    // __depends__: [GlobalConnectModule, CustomPopupMenu],
    __depends__: [GlobalConnectModule],

    // contextPadProvider: ['type', CustomContextPadProvider]
    contextPadProvider: ['type', CustomContextPadProviderModule]
};