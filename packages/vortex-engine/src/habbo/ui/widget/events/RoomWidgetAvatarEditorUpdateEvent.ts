import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The avatar editor closed, or asked to be hidden. Two types with no payload — and the me-menu
 * reacts to both identically, closing its "my clothes" view.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetAvatarEditorUpdateEvent.as
 */
export class RoomWidgetAvatarEditorUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetAvatarEditorUpdateEvent.as::HIDE_AVATAR_EDITOR
    // Name DERIVED (`_SafeStr_10456`), from its value.
    public static readonly HIDE_AVATAR_EDITOR: string = 'RWUE_HIDE_AVATAR_EDITOR';

    // AS3: .../widget/events/RoomWidgetAvatarEditorUpdateEvent.as::AVATAR_EDITOR_CLOSED
    // Name DERIVED (`_SafeStr_10920`), from its value.
    public static readonly AVATAR_EDITOR_CLOSED: string = 'RWUE_AVATAR_EDITOR_CLOSED';

    // AS3: .../widget/events/RoomWidgetAvatarEditorUpdateEvent.as::RoomWidgetAvatarEditorUpdateEvent()
    // The two Flash Event flags AS3 forwards are dropped — see RoomWidgetHabboClubUpdateEvent.
    constructor(type: string)
    {
        super(type);
    }
}
