import type {IDisposable} from '@core/runtime/IDisposable';
import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

/**
 * VariableTypePicker — the four source-type toggle buttons (furni / user / global / context) at the
 * top of the overview tab. Exactly one is selected; clicking another fires the select callback with
 * the newly-selected button's id (which the layout sets to the matching source-type code, so callers
 * compare it directly against a variable's `variableTarget`).
 *
 * The selection is driven by the buttons' Flash state bitfield exactly as AS3 does: 0x10 marks the
 * highlighted/selected button, 0x04 is cleared on the others; update() re-asserts 0x10 on the
 * selected button each frame in case the window system dropped it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/common/VariableTypePicker.as
 */
export class VariableTypePicker implements IDisposable, IUpdateReceiver
{
    // AS3: VariableTypePicker.as::SELECTION_TYPES
    private static readonly SELECTION_TYPES: string[] = ['furni', 'user', 'global', 'context'];

    // AS3: VariableTypePicker.as::_disposed
    private _disposed: boolean = false;

    // AS3: VariableTypePicker.as::_container
    private _container: IWindowContainer | null;

    // AS3: VariableTypePicker.as::_onSelectCallback
    private _onSelectCallback: ((id: number) => void) | null;

    // AS3: VariableTypePicker.as::_selected (name derived: selected type name)
    private _selected: string | null = null;

    // AS3: VariableTypePicker.as::_SafeStr_7433 (name derived: selected button id)
    private _selectedId: number = 0;

    // AS3: VariableTypePicker.as::VariableTypePicker()
    constructor(container: IWindowContainer, onSelect: (id: number) => void)
    {
        this._container = container;
        this._onSelectCallback = onSelect;
        this.setMode(VariableTypePicker.SELECTION_TYPES[0], true);

        for(const type of VariableTypePicker.SELECTION_TYPES)
        {
            const button = this.getButton(type);

            if(button != null)
            {
                button.addEventListener('WME_OUT', this._maybeCancelEvent);
                button.addEventListener('WME_UP', this._maybeCancelEvent);
            }
        }
    }

    // AS3: VariableTypePicker.as::maybeCancelEvent()
    private _maybeCancelEvent = (event: WindowMouseEvent): void =>
    {
        const button = event.target as unknown as IInteractiveWindow | null;

        if(button == null)
        {
            return;
        }

        if(event.type === 'WME_OUT' && button.id === this._selectedId)
        {
            event.preventWindowOperation();
        }

        if(event.type === 'WME_UP')
        {
            this.setMode(this.getButtonTypeName(button));
            event.preventWindowOperation();
        }
    };

    // AS3: VariableTypePicker.as::getButtonTypeName()
    private getButtonTypeName(button: IInteractiveWindow): string
    {
        return button.name.split('_')[1];
    }

    // AS3: VariableTypePicker.as::setMode()
    private setMode(type: string, silent: boolean = false): void
    {
        this._selected = type;

        for(const other of VariableTypePicker.SELECTION_TYPES)
        {
            const button = this.getButton(other);

            if(button != null && this._selected !== other)
            {
                button.state = button.state & ~0x10;
                button.state = button.state & ~0x4;
            }
        }

        const selectedButton = this.getButton(this._selected)!;

        if(selectedButton.id !== this._selectedId)
        {
            this._selectedId = selectedButton.id;

            if(!silent)
            {
                this._onSelectCallback?.(this._selectedId);
            }
        }
    }

    // AS3: VariableTypePicker.as::get selectedType()
    get selectedType(): number
    {
        return this._selectedId;
    }

    // AS3: VariableTypePicker.as::set selectedType()
    set selectedType(id: number)
    {
        for(const type of VariableTypePicker.SELECTION_TYPES)
        {
            const button = this.getButton(type);

            if(button != null && button.id === id)
            {
                this.setMode(this.getButtonTypeName(button), true);
            }
        }
    }

    // AS3: VariableTypePicker.as::update()
    update(_deltaTime: number): void
    {
        if(this._container == null)
        {
            return;
        }

        for(const type of VariableTypePicker.SELECTION_TYPES)
        {
            const button = this.getButton(type);

            if(button != null && this._selected === type && (button.state & 0x10) === 0)
            {
                button.state = button.state | 16;
            }
        }
    }

    // AS3: VariableTypePicker.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._container = null;
        this._onSelectCallback = null;
        this._selected = null;
        this._disposed = true;
    }

    // AS3: VariableTypePicker.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: VariableTypePicker.as::getButton()
    private getButton(type: string): IInteractiveWindow | null
    {
        return (this._container?.findChildByName('type_' + type + '_button') ?? null) as unknown as IInteractiveWindow | null;
    }
}
