import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * The guardian leaves a chat review (header 349). Payload-free.
 *
 * Sent from every exit out of the review flow — the close link while waiting for other voters,
 * during the vote itself, and from both result windows — so the server can stop counting on this
 * voter whichever step they abandoned.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1872/_SafeCls_2921.as
 * (composer class itself is obfuscated; identified by those four senders in
 * `GuideSessionController.as`, and by `_composers[349]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.
 * `vortex-emulator` corroborates: `ChatReviewGuideDetachedMessageEvent = 349`.)
 */
export class ChatReviewGuideDetachedMessageComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_2921.as::_SafeStr_4556
    private _data: [] = [];

    // AS3: _SafeCls_2921.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
