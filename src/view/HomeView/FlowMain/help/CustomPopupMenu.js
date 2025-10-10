
import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu';
import Search from 'diagram-js/lib/features/search';
import ReactDOM from 'react-dom';
import React, { useEffect, useMemo } from 'react';


class CustomPopupMenu extends PopupMenu {
    static $inject = [
        'config.popupMenu',
        'eventBus',
        'canvas',
        'search'
    ];
    open(target, providerId, position, options) {
        if (!target) {
            throw new Error('target is missing');
        }

        if (!providerId) {
            throw new Error('providers for <' + providerId + '> not found');
        }

        if (!position) {
            throw new Error('position is missing');
        }

        if (this.isOpen()) {
            this.close();
        }

        const {
            entries,
            headerEntries,
            emptyPlaceholder
        } = this._getContext(target, providerId);

        this._current = {
            position,
            providerId,
            target,
            entries,
            headerEntries,
            emptyPlaceholder,
            container: this._createContainer({ provider: providerId }),
            options
        };
        const [provider] = this._getProviders(providerId);
        const entriesOrUpdater = provider.getPopupMenuEntries(target);
        console.log('[CustomPopupMenu open]', this._current, provider, entriesOrUpdater)

        this._emit('open');

        this._bindAutoClose();

        this._render();
    };
    _render() {

        const {
            position: _position,
            providerId: className,
            entries,
            headerEntries,
            emptyPlaceholder,
            options
        } = this._current;

        const entriesArray = Object.entries(entries).map(
            ([key, value]) => ({ id: key, ...value })
        );

        const headerEntriesArray = Object.entries(headerEntries).map(
            ([key, value]) => ({ id: key, ...value })
        );

        const position = _position && (
            (container) => this._ensureVisible(container, _position)
        );

        const scale = this._updateScale(this._current.container);

        const onClose = result => this.close(result);
        const onSelect = (event, entry, action) => this.trigger(event, entry, action);
        console.log('[CustomPopupMenu _render]', this._current, entriesArray, headerEntriesArray, position(this._current.container), scale, onClose, onSelect)
        ReactDOM.render(
            <PopupMenuBox position={position(this._current.container)} />,
            this._current.container
        );

    }
}

function PopupMenuBox(props) {
    const { position } = props;
    useEffect(() => {
        console.log('[PopupMenuBox]', position)
    })

    return (
        <div className='popup-menu-box' style={{ position: 'absolute' }}> PopupMenuBox </div>

    )
}


export default {
    __depends__: [Search],
    __init__: ['popupMenu'],
    popupMenu: ['type', CustomPopupMenu]
}