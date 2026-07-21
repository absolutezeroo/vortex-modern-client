import type {IWindow} from '@core/window/IWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {ISourceTypePicker} from './ISourceTypePicker';
import type {ISourceTypeListener} from './ISourceTypeListener';
import {SourceTypeOption} from './SourceTypeOption';

/**
 * SourceTypePicker — the (old) horizontal strip of source-type icons. Clones an option template per
 * available id, tracks the active option, tints the left/right margins to match the first/last
 * option's colour, and forwards the chosen source type to the listener.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/inputsources/SourceTypePicker.as
 */
export class SourceTypePicker implements ISourceTypePicker
{
    // AS3: SourceTypePicker.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: SourceTypePicker.as::_container
    private _container: IItemListWindow;

    // AS3: SourceTypePicker.as::_listener
    private _listener: ISourceTypeListener;

    // AS3: SourceTypePicker.as::_options (id -> option)
    private _options: OrderedMap<number, SourceTypeOption> = new OrderedMap<number, SourceTypeOption>();

    // AS3: SourceTypePicker.as::_active
    private _active: SourceTypeOption | null = null;

    // AS3: SourceTypePicker.as::_template (option template, cloned per id)
    private _template: IRegionWindow;

    // AS3: SourceTypePicker.as::_first
    private _first: SourceTypeOption | null = null;

    // AS3: SourceTypePicker.as::_last
    private _last: SourceTypeOption | null = null;

    // AS3: SourceTypePicker.as::_disposed
    private _disposed: boolean = false;

    // AS3: SourceTypePicker.as::SourceTypePicker()
    constructor(roomEvents: HabboUserDefinedRoomEvents, container: IItemListWindow, listener: ISourceTypeListener)
    {
        this._roomEvents = roomEvents;
        this._container = container;
        this._listener = listener;
        this._template = this.sourceOptionsList.getListItemAt(0) as unknown as IRegionWindow;
        this.sourceOptionsList.removeListItems();
    }

    // AS3: SourceTypePicker.as::initialize()
    initialize(ids: number[], currentSelection: number): void
    {
        if(this._active != null)
        {
            this._active.deactivate();
            this._active = null;
        }

        this._first = null;
        this._last = null;
        this.marginLeft.color = 4280427042;
        this.marginRight.color = 4280427042;

        const list = this.sourceOptionsList;

        list.removeListItems();

        for(const id of ids)
        {
            let option: SourceTypeOption;

            if(!this._options.hasKey(id))
            {
                option = new SourceTypeOption(this, this._template.clone() as unknown as IRegionWindow, id);
                this._options.add(id, option);
            }
            else
            {
                option = this._options.getValue(id)!;
            }

            if(this._first == null)
            {
                this._first = option;
            }

            this._last = option;
            list.addListItem(option.container);

            if(id === currentSelection)
            {
                this._active = option;
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
    }

    // AS3: SourceTypePicker.as::select()
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

    // AS3: SourceTypePicker.as::colorHasUpdated() (AS3 `internal`; called by SourceTypeOption)
    colorHasUpdated(option: SourceTypeOption): void
    {
        if(option === this._first)
        {
            this.marginLeft.color = (0xFF000000 | option.backgroundColor()) >>> 0;
        }

        if(option === this._last)
        {
            this.marginRight.color = (0xFF000000 | option.backgroundColor()) >>> 0;
        }
    }

    // AS3: SourceTypePicker.as::set disabled()
    set disabled(value: boolean)
    {
        const blend = value ? 0.5 : 1;

        this.marginLeft.blend = blend;
        this.marginRight.blend = blend;

        for(const option of this._options.getValues())
        {
            option.disabled = value;
        }
    }

    // AS3: SourceTypePicker.as::set visible()
    set visible(value: boolean)
    {
        this._container.visible = value;
    }

    // AS3: SourceTypePicker.as::onClick() (AS3 `internal`; called by SourceTypeOption)
    onClick(option: SourceTypeOption | null): void
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

    // AS3: SourceTypePicker.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: SourceTypePicker.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;
        this._template.dispose();
        this._template = null as unknown as IRegionWindow;

        for(const option of this._options.getValues())
        {
            option.dispose();
        }

        this._options.dispose();
        this._options = null as unknown as OrderedMap<number, SourceTypeOption>;
    }

    // AS3: SourceTypePicker.as::get marginLeft()
    private get marginLeft(): IWindow
    {
        return this._container.findChildByName('margin_item_color_left') as unknown as IWindow;
    }

    // AS3: SourceTypePicker.as::get marginRight()
    private get marginRight(): IWindow
    {
        return this._container.findChildByName('margin_item_color_right') as unknown as IWindow;
    }

    // AS3: SourceTypePicker.as::get sourceOptionsList()
    private get sourceOptionsList(): IItemListWindow
    {
        return this._container.findChildByName('source_options_list') as unknown as IItemListWindow;
    }
}
