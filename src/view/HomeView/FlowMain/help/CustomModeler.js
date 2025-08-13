/**
 * A modeler for BPMN 2.0 diagrams.
 *
 *
 * ## Extending the Modeler
 *
 * In order to extend the viewer pass extension modules to bootstrap via the
 * `additionalModules` option. An extension module is an object that exposes
 * named services.
 *
 * The following example depicts the integration of a simple
 * logging component that integrates with interaction events:
 *
 *
 * ```javascript
 *
 * // logging component
 * function InteractionLogger(eventBus) {
 *   eventBus.on('element.hover', function(event) {
 *     console.log()
 *   })
 * }
 *
 * InteractionLogger.$inject = [ 'eventBus' ]; // minification save
 *
 * // extension module
 * var extensionModule = {
 *   __init__: [ 'interactionLogger' ],
 *   interactionLogger: [ 'type', InteractionLogger ]
 * };
 *
 * // extend the viewer
 * var bpmnModeler = new Modeler({ additionalModules: [ extensionModule ] });
 * bpmnModeler.importXML(...);
 * ```
 *
 *
 * ## Customizing / Replacing Components
 *
 * You can replace individual diagram components by redefining them in override modules.
 * This works for all components, including those defined in the core.
 *
 * Pass in override modules via the `options.additionalModules` flag like this:
 *
 * ```javascript
 * function CustomContextPadProvider(contextPad) {
 *
 *   contextPad.registerProvider(this);
 *
 *   this.getContextPadEntries = function(element) {
 *     // no entries, effectively disable the context pad
 *     return {};
 *   };
 * }
 *
 * CustomContextPadProvider.$inject = [ 'contextPad' ];
 *
 * var overrideModule = {
 *   contextPadProvider: [ 'type', CustomContextPadProvider ]
 * };
 *
 * var bpmnModeler = new Modeler({ additionalModules: [ overrideModule ]});
 * ```
 *
 */

import Modeler from 'bpmn-js/lib/Modeler';
import { initialDiagram } from './xmlStr'
import GlobalConnectModule from 'diagram-js/lib/features/global-connect';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import CustomPaletteProvider from './CustomPaletteProvider';
import CustomContextPadProvider from './CustomContextPadProvider';
export default class CustomModeler extends Modeler {
    constructor({ xml, ...options }) {
        super(options)
        this.importXML(xml ?? initialDiagram)
        console.log(this)
    }
}

CustomModeler.prototype._modules = [].concat(CustomModeler.prototype._modules, [CustomPaletteProvider, CustomContextPadProvider])