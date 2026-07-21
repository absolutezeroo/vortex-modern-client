import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {WiredUIPreset} from './WiredUIPreset';

/**
 * MiniAssetIconButtonPreset — the base of the small icon toggle buttons used by the furni picker.
 * Shows an icon, tracks selected/hovered state, and fires the callback on click (only while not
 * already selected). The base has no visual painting; the volter/pressed subclasses override updateUI.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/MiniAssetIconButtonPreset.as
 */
export class MiniAssetIconButtonPreset extends WiredUIPreset
{
    // AS3: MiniAssetIconButtonPreset.as::COLOR_BLUE_CLICKED
    private static readonly COLOR_BLUE_CLICKED: number = 4409728;

    // AS3: MiniAssetIconButtonPreset.as::COLOR_YELLOW_CLICKED
    private static readonly COLOR_YELLOW_CLICKED: number = 6975025;

    // AS3: MiniAssetIconButtonPreset.as::YELLOW_ASSETS
    protected static readonly YELLOW_ASSETS: string[] = ['furni_picks_1'];

    // AS3: MiniAssetIconButtonPreset.as::BLUE_ASSETS
    protected static readonly BLUE_ASSETS: string[] = ['furni_picks_2'];

    // AS3: MiniAssetIconButtonPreset.as::_container
    protected _container: IWindow;

    // AS3: MiniAssetIconButtonPreset.as::_selected
    protected _selected: boolean = false;

    // AS3: MiniAssetIconButtonPreset.as::_hovered
    protected _hovered: boolean = false;

    // AS3: MiniAssetIconButtonPreset.as::_assetName
    protected _assetName: string;

    // AS3: MiniAssetIconButtonPreset.as::_onClick
    private _onClick: (() => void) | null;

    // AS3: MiniAssetIconButtonPreset.as::MiniAssetIconButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, assetName: string, tooltip: string, onClick: (() => void) | null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._assetName = assetName;
        this._container = wiredStyle.createMiniButton();
        this._onClick = onClick;
        this.iconWrapper.assetUri = this.resolveAssetFullName(assetName);
        this.clickArea.addEventListener('WME_OVER', this._onHoverStart);
        this.clickArea.addEventListener('WME_OUT', this._onHoverEnd);
        this.clickArea.addEventListener('WME_CLICK', this.iconClicked);
        this.clickArea.toolTipCaption = tooltip;
        this.updateUI();
    }

    // AS3: MiniAssetIconButtonPreset.as::onHoverEnd()
    private _onHoverEnd = (_event: WindowMouseEvent): void =>
    {
        this._hovered = false;
        this.updateUI();
    };

    // AS3: MiniAssetIconButtonPreset.as::onHoverStart()
    private _onHoverStart = (_event: WindowMouseEvent): void =>
    {
        this._hovered = true;
        this.updateUI();
    };

    // AS3: MiniAssetIconButtonPreset.as::get selected()
    get selected(): boolean
    {
        return this._selected;
    }

    // AS3: MiniAssetIconButtonPreset.as::set selected()
    set selected(value: boolean)
    {
        this._selected = value;
        this.updateUI();
    }

    // AS3: MiniAssetIconButtonPreset.as::get selectedColor()
    protected get selectedColor(): number
    {
        if(MiniAssetIconButtonPreset.YELLOW_ASSETS.indexOf(this._assetName) !== -1)
        {
            return MiniAssetIconButtonPreset.COLOR_YELLOW_CLICKED;
        }

        if(MiniAssetIconButtonPreset.BLUE_ASSETS.indexOf(this._assetName) !== -1)
        {
            return MiniAssetIconButtonPreset.COLOR_BLUE_CLICKED;
        }

        throw new Error('Color for asset not configured');
    }

    // AS3: MiniAssetIconButtonPreset.as::updateUI()
    protected updateUI(): void
    {
    }

    // AS3: MiniAssetIconButtonPreset.as::iconClicked()
    protected iconClicked = (_event: WindowMouseEvent | null): void =>
    {
        if(this._onClick != null && !this._selected)
        {
            this._onClick();
        }
    };

    // AS3: MiniAssetIconButtonPreset.as::get window()
    override get window(): IWindow
    {
        return this._container;
    }

    // AS3: MiniAssetIconButtonPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._container.width = width;
    }

    // AS3: MiniAssetIconButtonPreset.as::hasStaticWidth()
    override hasStaticWidth(): boolean
    {
        return true;
    }

    // AS3: MiniAssetIconButtonPreset.as::get staticWidth()
    override get staticWidth(): number
    {
        return this._container.width;
    }

    // AS3: MiniAssetIconButtonPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._container.dispose();
        this._container = null as unknown as IWindow;
        this._assetName = null as unknown as string;
        this._onClick = null;
    }

    // AS3: MiniAssetIconButtonPreset.as::get clickArea()
    protected get clickArea(): IInteractiveWindow
    {
        return (this._container as unknown as IWindowContainer).findChildByName('mini_button_click') as unknown as IInteractiveWindow;
    }

    // AS3: MiniAssetIconButtonPreset.as::get iconWrapper()
    private get iconWrapper(): IStaticBitmapWrapperWindow
    {
        return (this._container as unknown as IWindowContainer).findChildByName('mini_button_icon') as unknown as IStaticBitmapWrapperWindow;
    }
}
