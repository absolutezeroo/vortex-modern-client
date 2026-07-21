import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Util} from '@habbo/roomevents/Util';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import {MiniAssetIconButtonPreset} from './MiniAssetIconButtonPreset';

/**
 * PressedButtonMiniAssetIconButtonPreset — the non-volter mini icon button: paints the click area
 * white when idle and tints it with the (lightened) selected colour when hovered or selected, and
 * fires the click on release.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/PressedButtonMiniAssetIconButtonPreset.as
 */
export class PressedButtonMiniAssetIconButtonPreset extends MiniAssetIconButtonPreset
{
    // AS3: PressedButtonMiniAssetIconButtonPreset.as::PressedButtonMiniAssetIconButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, assetName: string, tooltip: string, onClick: (() => void) | null)
    {
        super(roomEvents, presetManager, wiredStyle, assetName, tooltip, onClick);

        this.clickArea.addEventListener('WME_OUT', this._maybeCancelEvent);
        this.clickArea.addEventListener('WME_UP', this._maybeCancelEvent);
        this.updateUI();
    }

    // AS3: PressedButtonMiniAssetIconButtonPreset.as::maybeCancelEvent()
    private _maybeCancelEvent = (event: WindowMouseEvent): void =>
    {
        if(event.type === 'WME_OUT' && this._selected)
        {
            event.preventWindowOperation();
        }

        if(event.type === 'WME_UP')
        {
            this.iconClicked(null);
            event.preventWindowOperation();
        }
    };

    // AS3: PressedButtonMiniAssetIconButtonPreset.as::updateUI()
    protected override updateUI(): void
    {
        this.clickArea.setStateFlag(16, this._selected);
        this.clickArea.setStateFlag(4, this._hovered);

        if(!this._hovered && !this._selected)
        {
            this.clickArea.color = 16777215;

            return;
        }

        let color = this.selectedColor;
        let factor = 1.38;

        if(this._hovered && !this._selected)
        {
            factor = 1.6;
        }

        color = Util.lightenColor(color, factor);
        this.clickArea.color = color;
    }
}
