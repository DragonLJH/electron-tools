import ToggleModeModule from './viewer';

import BaseModule from 'bpmn-js-token-simulation/lib/base';

export default {
    __depends__: [
        BaseModule,
        ToggleModeModule
    ]
};