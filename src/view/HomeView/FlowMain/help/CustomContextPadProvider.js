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

    return actions;
};


function includes(array, item) {
    return array.indexOf(item) !== -1;
}


export default {
    __init__: [
        'contextPadProvider',
    ],
    __depends__: [GlobalConnectModule],

    contextPadProvider: ['type', CustomContextPadProvider]
};