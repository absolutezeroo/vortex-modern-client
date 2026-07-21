import type {IIconButtonWindow} from '@core/window/components/IIconButtonWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {WiredUIPreset} from './WiredUIPreset';
import {PaddedContainerPreset} from './PaddedContainerPreset';

/**
 * ContainerButtonPreset — a padded container that is itself a clickable button (the style's
 * container-button window), padded by the style's containerButtonPadding, firing the callback on
 * click.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/ContainerButtonPreset.as
 */
export class ContainerButtonPreset extends PaddedContainerPreset
{
    // AS3: ContainerButtonPreset.as::_onClick (click callback)
    private _onClick: (() => void) | null;

    // AS3: ContainerButtonPreset.as::ContainerButtonPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset, onClick: (() => void) | null, stretchMode: boolean = true)
    {
        super(
            roomEvents,
            presetManager,
            wiredStyle,
            wrapped,
            wiredStyle.containerButtonPaddingLeft,
            wiredStyle.containerButtonPaddingTop,
            wiredStyle.containerButtonPaddingLeft,
            wiredStyle.containerButtonPaddingTop,
            wiredStyle.createContainerButton() as unknown as IWindowContainer,
            stretchMode
        );

        this._onClick = onClick;
        this.button.addEventListener('WME_CLICK', this._buttonClicked);
    }

    // AS3: ContainerButtonPreset.as::buttonClicked()
    private _buttonClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._onClick != null)
        {
            this._onClick();
        }
    };

    // AS3: ContainerButtonPreset.as::get button()
    private get button(): IIconButtonWindow
    {
        return this._window as unknown as IIconButtonWindow;
    }
}
