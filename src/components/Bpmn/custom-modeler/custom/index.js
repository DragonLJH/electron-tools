import CustomContextPadProvider from './CustomContextPadProvider';
import GlobalConnectModule from 'diagram-js/lib/features/global-connect';
import CustomPalette from './CustomPalette';

export default {
  __init__: [
    'contextPadProvider',
    'paletteProvider',
  ],
  __depends__: [GlobalConnectModule],
  contextPadProvider: ['type', CustomContextPadProvider],
  paletteProvider: ['type', CustomPalette]
};
