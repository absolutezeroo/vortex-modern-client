import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reports a photo (header 1964).
 *
 * The port's previous signature was wrong in both order and meaning: the first field is the photo's
 * *extra data id* (a string), not a message, and the room/user/topic order differed. Taken from
 * AS3's own call site in `TopicsFlowHelpController`, which passes
 * `(reportedExtraDataId, reportedRoomId, reportedUserId, topic.id, reportedRoomObjectId, name, email)`.
 *
 * The two trailing strings are the reporter's own name and e-mail, read from the
 * `help_message_name` / `help_message_email` inputs of the report form — the guest-reporting flow
 * fills them, the in-client one sends empty strings. This port was missing both fields entirely,
 * which is why the composer stayed unregistered until now.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2542/_SafeCls_2702.as
 * (obfuscated in the primary dump; `_composers[1964] = _SafeCls_2702` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/help/CallForHelpFromPhotoMessageComposer.as).
 */
export class CallForHelpFromPhotoMessageComposer extends MessageComposer<unknown[]>
{
    // AS3: _SafeCls_2702.as::_SafeStr_4642
    private _data: unknown[];

    // AS3: _SafeCls_2702.as::CallForHelpFromPhotoMessageComposer()
    constructor(
        extraDataId: string,
        roomId: number,
        reportedUserId: number,
        topicId: number,
        roomObjectId: number,
        reporterName: string,
        reporterEmail: string
    )
    {
        super();

        this._data = [extraDataId, roomId, reportedUserId, topicId, roomObjectId, reporterName, reporterEmail];
    }

    // AS3: _SafeCls_2702.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
