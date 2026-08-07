import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomWidgetHandler} from '../../IRoomWidgetHandler';
import {RoomWidgetBase} from '../RoomWidgetBase';
import {RoomWidgetRoomObjectMessage} from '../messages/RoomWidgetRoomObjectMessage';

/**
 * What the two choosers share: picking a row selects that room object.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/chooser/ChooserWidgetBase.as
 */
export class ChooserWidgetBase extends RoomWidgetBase
{
    // AS3: .../widget/chooser/ChooserWidgetBase.as::ChooserWidgetBase()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);
    }

    // AS3: .../widget/chooser/ChooserWidgetBase.as::choose()
    // No null guard on the listener, as in AS3.
    choose(id: number, category: number): void
    {
        this.messageListener?.processWidgetMessage(
            new RoomWidgetRoomObjectMessage(RoomWidgetRoomObjectMessage.SELECT_OBJECT, id, category)
        );
    }
}
