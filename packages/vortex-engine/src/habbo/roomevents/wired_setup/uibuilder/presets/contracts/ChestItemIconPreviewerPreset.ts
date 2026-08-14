import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ProductIconWidget} from '@habbo/window/widgets/ProductIconWidget';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {WiredUIPreset} from '../WiredUIPreset';
import {
    ChestItemTypeRenderableWrapper
} from '../../../../wired_trading/chests/subcontrollers/views/ChestItemTypeRenderableWrapper';

/**
 * The small furniture icon beside the item-type picker, showing whatever is currently selected.
 *
 * `unknownImageUri` is cleared to the empty string in the constructor: with no selection the widget
 * shows *nothing* rather than its placeholder, which is what makes the header look empty until the
 * player picks something.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/contracts/ChestItemIconPreviewerPreset.as
 */
export class ChestItemIconPreviewerPreset extends WiredUIPreset
{
    // AS3: ChestItemIconPreviewerPreset.as::_window
    private _previewWindow: IWindowContainer | null;

    // AS3: ChestItemIconPreviewerPreset.as::_SafeStr_4718 (name derived: the previewed item)
    private _item: ChestItemType | null = null;

    // AS3: ChestItemIconPreviewerPreset.as::ChestItemIconPreviewerPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._previewWindow = wiredStyle.createProductIconPreviewer();

        const widget = this.widgetWindow?.widget as ProductIconWidget | null;

        if(widget) widget.unknownImageUri = '';
    }

    // AS3: ChestItemIconPreviewerPreset.as::set item()
    set item(value: ChestItemType | null)
    {
        this._item = value;

        const widget = this.widgetWindow?.widget as ProductIconWidget | null;

        if(!widget) return;

        // AS3 passes null straight through when there is no item, which clears the icon.
        widget.productInfo = value !== null ? new ChestItemTypeRenderableWrapper(value) : null;
    }

    // AS3: ChestItemIconPreviewerPreset.as::get item()
    get item(): ChestItemType | null
    {
        return this._item;
    }

    // AS3: ChestItemIconPreviewerPreset.as::get window()
    override get window(): IWindow
    {
        return this._previewWindow as unknown as IWindow;
    }

    /**
	 * AS3 overrides this only to call super — kept so the override is visible where the source has
	 * one, rather than silently relying on inheritance.
	 */
    // AS3: ChestItemIconPreviewerPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
    }

    // AS3: ChestItemIconPreviewerPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: ChestItemIconPreviewerPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._previewWindow?.width ?? 0;
    }

    // AS3: ChestItemIconPreviewerPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();

        this._previewWindow?.dispose();
        this._previewWindow = null;
    }

    // AS3: ChestItemIconPreviewerPreset.as::get widgetWindow()
    private get widgetWindow(): IWidgetWindow | null
    {
        return (this._previewWindow?.findChildByName('icon_preview') as IWidgetWindow | null) ?? null;
    }
}
