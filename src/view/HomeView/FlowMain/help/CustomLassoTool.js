
import LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool';


console.log('CustomLassoTool', LassoTool)
class CustomLassoTool extends LassoTool {
    static $inject = [
        'eventBus',
        'canvas',
        'dragging',
        'elementRegistry',
        'selection',
        'toolManager',
        'mouse'
    ];
    constructor(eventBus, canvas, dragging, elementRegistry, selection, toolManager, mouse) {
        super(eventBus, canvas, dragging, elementRegistry, selection, toolManager, mouse);
        console.log('CustomLassoTool constructor', eventBus, canvas, dragging, elementRegistry, selection, toolManager, mouse)
    }

}


export default {
    __depends__: [],
    __init__: ['lassoTool'],
    lassoTool: ['type', CustomLassoTool]
}