import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The new-user tutorial's two nudges towards the avatar editor: start it, or just light its icon
 * up. `MeMenuWidgetHandler` translates `HabboHelpTutorialEvent`'s `HHTPNUFWE_*` pair into these.
 *
 * The two type strings keep the help module's `HHTPNUFWE_` prefix rather than taking a widget-side
 * one, so a grep for `RW*` will not find them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetTutorialEvent.as
 */
export class RoomWidgetTutorialEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetTutorialEvent.as::AVATAR_EDITOR_STARTED
    // Name DERIVED (`_SafeStr_10446`), from its value "HHTPNUFWE_AE_STARTED".
    public static readonly AVATAR_EDITOR_STARTED: string = 'HHTPNUFWE_AE_STARTED';

    // AS3: .../widget/events/RoomWidgetTutorialEvent.as::AVATAR_EDITOR_HIGHLIGHT
    // Name DERIVED (`_SafeStr_11332`), from its value "HHTPNUFWE_AE_HIGHLIGHT".
    public static readonly AVATAR_EDITOR_HIGHLIGHT: string = 'HHTPNUFWE_AE_HIGHLIGHT';

    // AS3: .../widget/events/RoomWidgetTutorialEvent.as::RoomWidgetTutorialEvent()
    // The two Flash Event flags AS3 forwards are dropped — see RoomWidgetHabboClubUpdateEvent.
    constructor(type: string)
    {
        super(type);
    }
}
