import { assign } from 'min-dash';
import GlobalConnectModule from 'diagram-js/lib/features/global-connect';

class CustomPaletteProvider {
    static $inject = [
        'palette',
        'create',
        'elementFactory',
        'spaceTool',
        'lassoTool',
        'handTool',
        'globalConnect',
        'translate'
    ]
    _businessCustomOptions = {
        $attrs: {
            a: 1
        },
    }
    constructor(
        palette, create, elementFactory,
        spaceTool, lassoTool, handTool,
        globalConnect, translate
    ) {
        this._palette = palette;
        this._create = create;
        this._elementFactory = elementFactory;
        this._spaceTool = spaceTool;
        this._lassoTool = lassoTool;
        this._handTool = handTool;
        this._globalConnect = globalConnect;
        this._translate = translate;
        console.log('[CustomPaletteProvider]palette', palette)
        palette.registerProvider(this);
        setTimeout(() => {
            this._businessCustomOptions = {
                $attrs: {
                    a: 1, b: 2
                },
                name: 'tset'
            }
            palette._rebuild()
        }, 5000)
    }

    /**
     * @return {PaletteEntries}
     */
    getPaletteEntries() {
        const {
            _create: create,
            _elementFactory: elementFactory,
            _spaceTool: spaceTool,
            _lassoTool: lassoTool,
            _handTool: handTool,
            _globalConnect: globalConnect,
            _translate: translate,
            _businessCustomOptions: businessCustomOptions
        } = this;
        const actions = {};
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
        function createAction(type, group, className, title, options) {
            function createListener(event) {
                const shape = elementFactory.createShape(assign({ type }, options));
                _insetBusiness((k, v) => shape.businessObject.set(k, v), businessCustomOptions)
                create.start(event, shape);
            }

            const shortType = type.replace(/^bpmn:/, '');

            return {
                group,
                className,
                title: title || translate('Create {type}', { type: shortType }),
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
    }
}


export default {
    __init__: [
        'paletteProvider',
    ],
    __depends__: [GlobalConnectModule],
    paletteProvider: ['type', CustomPaletteProvider]
};