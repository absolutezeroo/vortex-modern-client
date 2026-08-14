import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';
import {PresetManager} from '../wired_setup/uibuilder/PresetManager';
import type {WiredStyle} from '../wired_setup/uibuilder/styles/WiredStyle';

/**
 * A {@link PresetManager} pinned to the "ubuntu" style.
 *
 * The base resolves `wiredStyle` per call; this one looks it up once in the constructor and returns
 * the same instance forever, which is what makes every window built through it share one look.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/UbuntuPresetManager.as
 */
export class UbuntuPresetManager extends PresetManager
{
    // AS3: UbuntuPresetManager.as::_SafeStr_9815 (name derived: the resolved ubuntu style)
    private _ubuntuStyle: WiredStyle;

    // AS3: UbuntuPresetManager.as::UbuntuPresetManager()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        super(roomEvents);

        this._ubuntuStyle = roomEvents.wiredCtrl.getStyleByName('ubuntu');
    }

    // AS3: UbuntuPresetManager.as::get wiredStyle()
    override get wiredStyle(): WiredStyle
    {
        return this._ubuntuStyle;
    }
}
