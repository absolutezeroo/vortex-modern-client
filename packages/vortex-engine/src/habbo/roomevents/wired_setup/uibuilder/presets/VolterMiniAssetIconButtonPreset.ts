import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {MiniAssetIconButtonPreset} from './MiniAssetIconButtonPreset';

/**
 * VolterMiniAssetIconButtonPreset — the volter mini icon button: paints the click area and its left/
 * right margin backgrounds inactive / hover / selected colours (all fully opaque).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/VolterMiniAssetIconButtonPreset.as
 */
export class VolterMiniAssetIconButtonPreset extends MiniAssetIconButtonPreset
{
    // AS3: VolterMiniAssetIconButtonPreset.as::COLOR_INACTIVE
    private static readonly COLOR_INACTIVE: number = 2236962;

    // AS3: VolterMiniAssetIconButtonPreset.as::COLOR_YELLOW_HOVERED
    private static readonly COLOR_YELLOW_HOVERED: number = 5527335;

    // AS3: VolterMiniAssetIconButtonPreset.as::COLOR_BLUE_HOVERED
    private static readonly COLOR_BLUE_HOVERED: number = 3356769;

    // AS3: VolterMiniAssetIconButtonPreset.as::VolterMiniAssetIconButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, assetName: string, tooltip: string, onClick: (() => void) | null)
    {
        super(roomEvents, presetManager, wiredStyle, assetName, tooltip, onClick);
    }

    // AS3: VolterMiniAssetIconButtonPreset.as::get hoverColor()
    protected get hoverColor(): number
    {
        if(MiniAssetIconButtonPreset.YELLOW_ASSETS.indexOf(this._assetName) !== -1)
        {
            return VolterMiniAssetIconButtonPreset.COLOR_YELLOW_HOVERED;
        }

        if(MiniAssetIconButtonPreset.BLUE_ASSETS.indexOf(this._assetName) !== -1)
        {
            return VolterMiniAssetIconButtonPreset.COLOR_BLUE_HOVERED;
        }

        throw new Error('Color for asset not configured');
    }

    // AS3: VolterMiniAssetIconButtonPreset.as::updateUI()
    protected override updateUI(): void
    {
        let color = VolterMiniAssetIconButtonPreset.COLOR_INACTIVE;

        if(this._hovered)
        {
            color = this.hoverColor;
        }
        else if(this._selected)
        {
            color = this.selectedColor;
        }

        color = (color | 4278190080) >>> 0;
        this.clickArea.color = color;
        this.marginLeftBg.color = color;
        this.marginRightBg.color = color;
    }

    // AS3: VolterMiniAssetIconButtonPreset.as::get marginLeftBg()
    private get marginLeftBg(): IWindow
    {
        return (this._container as unknown as IWindowContainer).findChildByName('margin_item_color_left') as unknown as IWindow;
    }

    // AS3: VolterMiniAssetIconButtonPreset.as::get marginRightBg()
    private get marginRightBg(): IWindow
    {
        return (this._container as unknown as IWindowContainer).findChildByName('margin_item_color_right') as unknown as IWindow;
    }
}
