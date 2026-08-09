import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Opens a chat-review report (header 3970).
 *
 * One string, the report text typed into the guide window's input widget — AS3's
 * `GuideSessionController` refuses to send it when empty. The port's previous
 * `(roomId, reportedUserId)` pair matched no revision of this message.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2982/_SafeCls_2981.as
 * (obfuscated in the primary dump; `_composers[3970] = _SafeCls_2981` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/help/ChatReviewSessionCreateMessageComposer.as).
 */
export class ChatReviewSessionCreateMessageComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_2981.as::_SafeStr_4556
    private _data: [string];

    // AS3: _SafeCls_2981.as::ChatReviewSessionCreateMessageComposer()
    constructor(message: string)
    {
        super();

        this._data = [message];
    }

    // AS3: _SafeCls_2981.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
