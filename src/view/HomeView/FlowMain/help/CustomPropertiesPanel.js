import { domify, query } from 'min-dom'
import { reduce, isArray, find } from 'min-dash'
import { flattenTree } from '@src/utils'
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
        console.log('[BpmnPropertiesPanel]injector', injector)
        console.log('[BpmnPropertiesPanel]modeling', modeling)
        console.log('[BpmnPropertiesPanel]', element, eventBus)
    }, [])
    const stateDiv = useMemo(() => {
        const { selectedElement: { businessObject } } = state
        if (businessObject) {
            const {
                $attrs: attrs,
                $type: type,
                id,
                sourceRef,
                targetRef,
                eventDefinitions,
                name,
                ...data
            } = businessObject;
            return (<div className='bio-properties-panel-input-box'>
                <div className='id'>
                    <label>id</label>
                    <input value={id} readOnly />
                </div>
                {name && <div className='name'>
                    <label>name</label>
                    <input value={name} onChange={(e) => {
                        // state.selectedElement
                        //     = { ...state.selectedElement, businessObject: { ...state.selectedElement.businessObject, name: e.target.value } }
                        // _update(state.selectedElement)
                        modeling.updateProperties(state.selectedElement, { name: e.target.value })

                        console.log(e.target.value)

                    }} />
                </div>}
            </div>)
        }
        console.log('stateDiv', state)
        return <></>
    }, [state])

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
        {stateDiv}
    </div>
}
