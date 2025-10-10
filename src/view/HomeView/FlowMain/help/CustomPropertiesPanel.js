import { domify, query } from 'min-dom'
import { reduce, isArray, find, set } from 'min-dash'
import { flattenTree, showModal } from '@src/utils'
import { useUnmount } from '@src/utils/useHooks'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';


class CustomPropertiesPanel {
    constructor(config, injector, eventBus) {
        const {
            parent,
            layout: layoutConfig,
            description: descriptionConfig,
            tooltip: tooltipConfig,
            feelPopupContainer,
            getFeelPopupLinks
        } = config || {};
        console.log('[CustomPropertiesPanel]', { config, injector, eventBus })
        this._eventBus = eventBus;
        this._injector = injector;
        this._layoutConfig = layoutConfig;
        this._descriptionConfig = descriptionConfig;
        this._tooltipConfig = tooltipConfig;
        this._feelPopupContainer = feelPopupContainer;
        this._getFeelPopupLinks = getFeelPopupLinks;
        this._container = domify('<div style="height: 100%" tabindex="-1" class="bio-properties-panel-container"></div>');
        eventBus.on('diagram.init', () => {
            console.log('[CustomPropertiesPanel] diagram.init', parent)
            if (parent) {
                this.attachTo(parent);
            }
        });
        eventBus.on('diagram.destroy', () => {
            this.detach();
        });
        eventBus.on('root.added', event => {
            const {
                element
            } = event;
            this._render(element);
        });

        // [
        //     // 'element.click', 
        //     ...flattenTree(["root", "shape", "connection"].map((_) => [`${_}.added`, `${_}.changed`, `${_}.remove`]))].forEach((_) => {
        //         eventBus.on(_, event => {
        //             const { element: { businessObject, incoming, outgoing } } = event;
        //             if (businessObject) {
        //                 const {
        //                     $attrs: attrs,
        //                     $type: type,
        //                     id,
        //                     sourceRef,
        //                     targetRef,
        //                     eventDefinitions,
        //                     ...data
        //                 } = businessObject;
        //                 console.log(_, {
        //                     attrs,
        //                     type,
        //                     id,
        //                     sourceRef,
        //                     targetRef,
        //                     eventDefinitions, data, incoming, outgoing
        //                 })
        //             }
        //         });
        //     })


    }

    /**
     * Attach the properties panel to a parent node.
     *
     * @param {HTMLElement} container
     */
    attachTo(container) {
        if (!container) {
            throw new Error('container required');
        }

        // unwrap jQuery if provided
        if (container.get && container.constructor.prototype.jquery) {
            container = container.get(0);
        }
        if (typeof container === 'string') {
            container = query(container);
        }

        // (1) detach from old parent
        this.detach();

        // (2) append to parent container
        console.log('[attachTo]', container, this._container)
        container.appendChild(this._container);

        // (3) notify interested parties
        this._eventBus.fire('propertiesPanel.attach');
    }

    /**
     * Detach the properties panel from its parent node.
     */
    detach() {
        const parentNode = this._container.parentNode;
        if (parentNode) {
            parentNode.removeChild(this._container);
            this._eventBus.fire('propertiesPanel.detach');
        }
    }

    /**
     * Register a new properties provider to the properties panel.
     *
     * @param {Number} [priority]
     * @param {PropertiesProvider} provider
     */
    registerProvider(priority, provider) {
        if (!provider) {
            provider = priority;
            priority = 1000;
        }
        if (typeof provider.getGroups !== 'function') {
            console.error('Properties provider does not implement #getGroups(element) API');
            return;
        }
        this._eventBus.on('propertiesPanel.getProviders', priority, function (event) {
            event.providers.push(provider);
        });
        this._eventBus.fire('propertiesPanel.providersChanged');
    }

    /**
     * Updates the layout of the properties panel.
     * @param {Object} layout
     */
    setLayout(layout) {
        this._eventBus.fire('propertiesPanel.setLayout', {
            layout
        });
    }
    _getProviders() {
        const event = this._eventBus.createEvent({
            type: 'propertiesPanel.getProviders',
            providers: []
        });
        this._eventBus.fire(event);
        return event.providers;
    }
    _render(element) {
        const canvas = this._injector.get('canvas');
        if (!element) {
            element = canvas.getRootElement();
        }

        if (isImplicitRoot(element)) {
            return;
        }
        ReactDOM.render(
            <BpmnPropertiesPanel
                element={element}
                injector={this._injector}
                getProviders={this._getProviders.bind(this)}
                layoutConfig={this._layoutConfig}
                descriptionConfig={this._descriptionConfig}
                tooltipConfig={this._tooltipConfig}
                feelPopupContainer={this._feelPopupContainer}
                getFeelPopupLinks={this._getFeelPopupLinks}
            />,
            this._container
        );

        this._eventBus.fire('propertiesPanel.rendered');
    }
    _destroy() {
        if (this._container) {
            ReactDOM.render(null, this._container);
            this._eventBus.fire('propertiesPanel.destroyed');
        }
    }
}
CustomPropertiesPanel.$inject = ['config.propertiesPanel', 'injector', 'eventBus'];
export default {
    __depends__: [],
    __init__: ['propertiesPanel'],
    propertiesPanel: ['type', CustomPropertiesPanel]
};


function isImplicitRoot(element) { return element && element.isImplicit }

function findElement(elements, element) { return find(elements, e => e === element); }

function elementExists(element, elementRegistry) { return element && elementRegistry.get(element.id); }
function BpmnPropertiesPanel(props) {
    const {
        element,
        injector,
        getProviders,
        layoutConfig: initialLayoutConfig,
        descriptionConfig,
        tooltipConfig,
        feelPopupContainer,
        getFeelPopupLinks
    } = props;
    const canvas = injector.get('canvas');
    const elementRegistry = injector.get('elementRegistry');
    const eventBus = injector.get('eventBus');
    const modeling = injector.get('modeling');
    const translate = injector.get('translate');
    const [state, setState] = useState({
        selectedElement: element
    });
    const selectedElement = state.selectedElement;

    useEffect(() => {
        console.log('[BpmnPropertiesPanel]props', props)
    }, [])

    /**
     * @param {djs.model.Base | Array < djs.model.Base >} element
                */
    const _update = element => {
        console.log('_update', element)
        if (!element) {
            return;
        }
        let newSelectedElement = element;

        // handle labels
        if (newSelectedElement && newSelectedElement.type === 'label') {
            newSelectedElement = newSelectedElement.labelTarget;
        }
        setState({
            ...state,
            selectedElement: newSelectedElement
        });

        // notify interested parties on property panel updates
        eventBus.fire('propertiesPanel.updated', {
            element: newSelectedElement
        });
    };


    // (2) react on element changes

    // (2a) selection changed
    useEffect(() => {
        const onSelectionChanged = e => {
            console.log('[selection.changed]', e)
            const {
                newSelection = []
            } = e;
            if (newSelection.length > 1) {
                return _update(newSelection);
            }
            const newElement = newSelection[0];
            const rootElement = canvas.getRootElement();
            if (isImplicitRoot(rootElement)) {
                return;
            }
            _update(newElement || rootElement);
        };
        eventBus.on('selection.changed', onSelectionChanged);
        return () => {
            eventBus.off('selection.changed', onSelectionChanged);
        };
    }, []);

    // (2b) selected element changed
    useEffect(() => {
        const onElementsChanged = e => {
            const elements = e.elements;
            const updatedElement = findElement(elements, selectedElement);
            if (updatedElement && elementExists(updatedElement, elementRegistry)) {
                _update(updatedElement);
            }
        };
        eventBus.on('elements.changed', onElementsChanged);
        return () => {
            eventBus.off('elements.changed', onElementsChanged);
        };
    }, [selectedElement]);

    // (2c) root element changed
    useEffect(() => {
        const onRootAdded = e => {
            const element = e.element;
            _update(element);
        };
        eventBus.on('root.added', onRootAdded);
        return () => {
            eventBus.off('root.added', onRootAdded);
        };
    }, [selectedElement]);

    // (2d) provided entries changed
    useEffect(() => {
        const onProvidersChanged = () => {
            _update(selectedElement);
        };
        eventBus.on('propertiesPanel.providersChanged', onProvidersChanged);
        return () => {
            eventBus.off('propertiesPanel.providersChanged', onProvidersChanged);
        };
    }, [selectedElement]);

    // (2e) element templates changed
    useEffect(() => {
        const onTemplatesChanged = () => {
            _update(selectedElement);
        };
        eventBus.on('elementTemplates.changed', onTemplatesChanged);
        return () => {
            eventBus.off('elementTemplates.changed', onTemplatesChanged);
        };
    }, [selectedElement]);

    // (3) create properties panel context
    const bpmnPropertiesPanelContext = {
        selectedElement,
        injector,
        getService(type, strict) {
            return injector.get(type, strict);
        }
    };

    // (4) retrieve groups for selected element
    const providers = getProviders(selectedElement);
    const groups = useMemo(() => {
        return reduce(providers, function (groups, provider) {
            // do not collect groups for multi element state
            if (isArray(selectedElement)) {
                return [];
            }
            const updater = provider.getGroups(selectedElement);
            return updater(groups);
        }, []);
    }, [providers, selectedElement]);

    // (5) notify layout changes
    const [layoutConfig, setLayoutConfig] = useState(initialLayoutConfig || {});
    const onLayoutChanged = useCallback(newLayout => {
        eventBus.fire('propertiesPanel.layoutChanged', {
            layout: newLayout
        });
    }, [eventBus]);

    // React to external layout changes
    useEffect(() => {
        const cb = e => {
            const {
                layout
            } = e;
            setLayoutConfig(layout);
        };
        eventBus.on('propertiesPanel.setLayout', cb);
        return () => eventBus.off('propertiesPanel.setLayout', cb);
    }, [eventBus, setLayoutConfig]);

    // (6) notify description changes
    const onDescriptionLoaded = description => {
        eventBus.fire('propertiesPanel.descriptionLoaded', {
            description
        });
    };

    // (7) notify tooltip changes
    const onTooltipLoaded = tooltip => {
        eventBus.fire('propertiesPanel.tooltipLoaded', {
            tooltip
        });
    };
    // return jsxRuntime.jsx(BpmnPropertiesPanelContext.Provider, {
    //     value: bpmnPropertiesPanelContext,
    //     children: jsxRuntime.jsx(propertiesPanel.PropertiesPanel, {
    //         element: selectedElement,
    //         headerProvider: PanelHeaderProvider(translate),
    //         placeholderProvider: PanelPlaceholderProvider(translate),
    //         groups: groups,
    //         layoutConfig: layoutConfig,
    //         layoutChanged: onLayoutChanged,
    //         descriptionConfig: descriptionConfig,
    //         descriptionLoaded: onDescriptionLoaded,
    //         tooltipConfig: tooltipConfig,
    //         tooltipLoaded: onTooltipLoaded,
    //         feelPopupContainer: feelPopupContainer,
    //         getFeelPopupLinks: getFeelPopupLinks,
    //         eventBus: eventBus
    //     })
    // });
    return <div className='bpmn-properties-panel'>
        <PanelBox key={state.selectedElement.id} selectedElement={state.selectedElement} modeling={modeling} eventBus={eventBus} />
    </div>
}
const PanelBox = (props) => {
    const { selectedElement, modeling, eventBus } = props
    const _process = useMemo(() => selectedElement.type === "bpmn:Process", [selectedElement.type])
    if (!selectedElement.businessObject) return <></>
    const [_businessObject, setBusinessObject] = useState(selectedElement.businessObject)
    const [record, setRecord] = useState(null)
    useUnmount(() => {
        console.log("卸载时拿到最新的值:", _businessObject, _process);
        if (!_process && !!record)
            showModal({
                title: "提示",
                message: "是否更新修改",
                confirmText: "确认",
                cancelText: "取消",
            }).then((ok) => {
                if (ok) {
                    const {
                        $attrs: attrs,
                        $type: type,
                        id,
                        sourceRef,
                        targetRef,
                        eventDefinitions,
                        name,
                        ...data
                    } = _businessObject ?? {};
                    modeling.updateProperties(selectedElement, { ...attrs, name })
                }
            })
    }, [_businessObject]);
    const updateName = (name) => {
        setRecord((prev) => ({ ...prev, name }))
        setBusinessObject((prev) => ({ ...prev, name }))
    }
    const updateAttr = (key, value) => {
        setRecord((prev) => ({ ...prev, $attrs: { ...prev.$attrs, [key]: value } }))
        setBusinessObject((prev) => ({ ...prev, $attrs: { ...prev.$attrs, [key]: value } }))
    }
    return (<div className='bio-properties-panel-input-box'>
        {_process ? <span>Please select an element.</span> : <>
            <div className='id'>
                <label>id</label>
                <input value={selectedElement.id} readOnly />
            </div>
            <div className='name'>
                <label>name</label>
                <input value={_businessObject.name || ""} onChange={(e) => {
                    let value = e?.target?.value
                    if (value) updateName(value)
                }} />
            </div>
            {
                Object.keys(_businessObject.$attrs || {}).map((key) => {
                    return <div key={key} className='attr'>
                        <label>{key}</label>
                        <input value={_businessObject.$attrs[key]} onChange={(e) => {
                            let value = e?.target?.value
                            if (value) updateAttr(key, value)
                        }} />
                    </div>
                })
            }
            <div className='save-button'>
                save
            </div>
        </>}
    </div>)
}