import {
    domify,
    classes as domClasses,
    event as domEvent
} from 'min-dom';
import TokenSimulationModule from 'bpmn-js-token-simulation/lib/viewer';


const TOGGLE_MODE_EVENT = 'tokenSimulation.toggleMode';

export default function CustomToggleMode(eventBus, canvas, selection) {
    this._eventBus = eventBus;
    this._canvas = canvas;

    this._active = false;

    eventBus.on('import.parse.start', () => {

        if (this._active) {
            this.toggleMode(false);

            eventBus.once('import.done', () => {
                this.toggleMode(true);
            });
        }
    });

    eventBus.on('diagram.init', () => {
        this._canvasParent = this._canvas.getContainer().parentNode;

        this._init();
    });

    eventBus.on('import.parse.start', () => {

        if (this._active) {
            this.toggleMode(false);

            eventBus.once('import.done', () => {
                this.toggleMode(true);
            });
        }
    });
}

CustomToggleMode.prototype._init = function () {
    this._container = domify(`
      <div class="bts-toggle-mode">
        Token Simulation Open
      </div>
    `);

    domEvent.bind(this._container, 'click', () => this.toggleMode());

    this._canvas.getContainer().appendChild(this._container);
};

CustomToggleMode.prototype.toggleMode = function (active = !this._active) {
    if (active === this._active) return;
    if (active) {
        console.log("this._canvas",this._canvas)
        this._container.innerHTML = `Token Simulation Close`;
        domClasses(this._canvasParent).add('simulation');
    } else {
        this._container.innerHTML = `Token Simulation Open`;
        domClasses(this._canvasParent).remove('simulation');
    }

    this._eventBus.fire(TOGGLE_MODE_EVENT, {
        active
    });

    this._active = active;
};

CustomToggleMode.$inject = ['eventBus', 'canvas'];