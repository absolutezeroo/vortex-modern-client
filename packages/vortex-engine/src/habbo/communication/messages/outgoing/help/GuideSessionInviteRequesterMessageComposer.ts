import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * The guide invites the requester into the guide's own room (header 3336). Payload-free — the
 * server knows both ends of the session.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_3297.as
 * (composer class itself is obfuscated; identified by `GuideSessionController.as::
 * onGuideOngoingEvent()`'s `invite_button`, its only sender, and by `_composers[3336]` in the
 * registry sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.
 * `vortex-emulator` corroborates: `GuideSessionInviteRequesterMessageEvent = 3336`.)
 */
export class GuideSessionInviteRequesterMessageComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3297.as::_SafeStr_4556
    private _data: [] = [];

    // AS3: _SafeCls_3297.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
