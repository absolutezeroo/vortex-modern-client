import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IIconButtonWindow} from '@core/window/components/IIconButtonWindow';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {ISourceTypePicker} from '../ISourceTypePicker';
import type {ISourceTypeListener} from '../ISourceTypeListener';
import {NewSourceTypeOption} from './NewSourceTypeOption';

/**
 * NewSourceTypePicker — the new (illumina) source-type picker: clones first/mid/last button templates
 * per source id with a splitter between each, tracks the active option, and tints each splitter to
 * blend the colours of its two neighbouring options.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/inputsources/newpicker/NewSourceTypePicker.as
 */
export class NewSourceTypePicker implements ISourceTypePicker
{
    // AS3: NewSourceTypePicker.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: NewSourceTypePicker.as::_container
    private _container: IItemListWindow;

    // AS3: NewSourceTypePicker.as::_listener
    private _listener: ISourceTypeListener;

    // AS3: NewSourceTypePicker.as::_options (id -> option)
    private _options: OrderedMap<number, NewSourceTypeOption> = new OrderedMap<number, NewSourceTypeOption>();

    // AS3: NewSourceTypePicker.as::_splitters
    private _splitters: IWindowContainer[] = [];

    // AS3: NewSourceTypePicker.as::_active
    private _active: NewSourceTypeOption | null = null;

    // AS3: NewSourceTypePicker.as::_firstTemplate
    private _firstTemplate: IIconButtonWindow;

    // AS3: NewSourceTypePicker.as::_midTemplate
    private _midTemplate: IIconButtonWindow;

    // AS3: NewSourceTypePicker.as::_lastTemplate
    private _lastTemplate: IIconButtonWindow;

    // AS3: NewSourceTypePicker.as::_splitterTemplate
    private _splitterTemplate: IWindowContainer;

    // AS3: NewSourceTypePicker.as::_splitterBaseColor
    private _splitterBaseColor: number;

    // AS3: NewSourceTypePicker.as::_initializing
    private _initializing: boolean = false;

    // AS3: NewSourceTypePicker.as::_disposed
    private _disposed: boolean = false;

    // AS3: NewSourceTypePicker.as::NewSourceTypePicker()
    constructor(roomEvents: HabboUserDefinedRoomEvents, container: IItemListWindow, listener: ISourceTypeListener)
    {
        this._roomEvents = roomEvents;
        this._container = container;
        this._listener = listener;
        this._firstTemplate = container.getListItemAt(0) as unknown as IIconButtonWindow;
        this._splitterTemplate = container.getListItemAt(1) as unknown as IWindowContainer;
        this._splitterBaseColor = this._splitterTemplate.getChildAt(0)!.color & 0xFFFFFF;
        this._midTemplate = container.getListItemAt(2) as unknown as IIconButtonWindow;
        this._lastTemplate = container.getListItemAt(4) as unknown as IIconButtonWindow;
        container.removeListItems();
    }

    // AS3: NewSourceTypePicker.as::clear()
    private clear(): void
    {
        this._container.removeListItems();

        for(const option of this._options.getValues())
        {
            option.dispose();
        }

        for(const splitter of this._splitters)
        {
            splitter.dispose();
        }
    }

    // AS3: NewSourceTypePicker.as::initialize()
    initialize(ids: number[], currentSelection: number): void
    {
        this._initializing = true;

        if(this._active != null)
        {
            this._active.deactivate();
            this._active = null;
        }

        this.clear();
        this._options = new OrderedMap<number, NewSourceTypeOption>();
        this._splitters = [];

        for(let i = 0; i < ids.length; i++)
        {
            const id = ids[i];
            let template: IIconButtonWindow;

            if(i === 0)
            {
                template = this._firstTemplate.clone() as unknown as IIconButtonWindow;
            }
            else if(i === ids.length - 1)
            {
                template = this._lastTemplate.clone() as unknown as IIconButtonWindow;
            }
            else
            {
                template = this._midTemplate.clone() as unknown as IIconButtonWindow;
            }

            const option = new NewSourceTypeOption(this, template, id);

            this._options.add(id, option);
            this._container.addListItem(option.container);

            if(id === currentSelection)
            {
                this._active = option;
            }

            if(i !== ids.length - 1)
            {
                const splitter = this._splitterTemplate.clone() as unknown as IWindowContainer;

                this._container.addListItem(splitter);
                this._splitters.push(splitter);
            }
        }

        if(this._active != null)
        {
            this._active.activate();
        }
        else if(ids.length > 0)
        {
            this.onClick(this._options.getValue(ids[0])!);
        }

        this._initializing = false;
        this.updateColorings();
    }

    // AS3: NewSourceTypePicker.as::select()
    select(id: number): void
    {
        for(const option of this._options.getValues())
        {
            if(id === option.option)
            {
                this.onClick(option);
            }
        }
    }

    // AS3: NewSourceTypePicker.as::onClick() (AS3 `internal`; called by NewSourceTypeOption)
    onClick(option: NewSourceTypeOption | null): void
    {
        if(option === this._active)
        {
            return;
        }

        if(this._active != null)
        {
            this._active.deactivate();
            this._active = null;
        }

        if(option != null)
        {
            this._active = option;
            this._active.activate();
            this._listener.sourceType = this._active.option;
        }
    }

    // AS3: NewSourceTypePicker.as::multiplyColors()
    private multiplyColors(a: number, b: number): number
    {
        const r = Math.trunc(((a >> 16) & 0xFF) * ((b >> 16) & 0xFF) / 255);
        const g = Math.trunc(((a >> 8) & 0xFF) * ((b >> 8) & 0xFF) / 255);
        const bl = Math.trunc((a & 0xFF) * (b & 0xFF) / 255);

        return ((r << 16) | (g << 8) | bl) >>> 0;
    }

    // AS3: NewSourceTypePicker.as::updateColorings() (AS3 `internal`; called by NewSourceTypeOption)
    updateColorings(): void
    {
        if(this._initializing)
        {
            return;
        }

        for(let i = 0; i < this._splitters.length; i++)
        {
            const splitter = this._splitters[i];
            const left = this._options.getValueByIndex(i)!;
            const right = this._options.getValueByIndex(i + 1)!;
            let color = 16777215;

            if(left.active || (!right.active && left.hovered))
            {
                color = left.color;
            }
            else if(right.active || right.hovered)
            {
                color = right.color;
            }

            color = this.multiplyColors(this._splitterBaseColor, color);

            const child = splitter.getChildAt(0)!;

            child.color = ((child.color & -16777216) | (color & 0xFFFFFF)) >>> 0;
        }
    }

    // AS3: NewSourceTypePicker.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: NewSourceTypePicker.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;
        this.clear();
        this._container.dispose();
        this._container = null as unknown as IItemListWindow;
        this._firstTemplate.dispose();
        this._firstTemplate = null as unknown as IIconButtonWindow;
        this._midTemplate.dispose();
        this._midTemplate = null as unknown as IIconButtonWindow;
        this._lastTemplate.dispose();
        this._lastTemplate = null as unknown as IIconButtonWindow;
        this._splitterTemplate.dispose();
        this._splitterTemplate = null as unknown as IWindowContainer;
        this._options.dispose();
        this._options = null as unknown as OrderedMap<number, NewSourceTypeOption>;
        this._splitters = null as unknown as IWindowContainer[];
        this._active = null;
    }
}
