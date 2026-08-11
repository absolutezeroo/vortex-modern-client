import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reports a user or a room to moderation (header 732) — the general call for help.
 *
 * `chatEntries` is a flat pair list; AS3 writes `length / 2` as the count and then concatenates the
 * array, so the wire carries the pair count, not the element count.
 *
 * The two trailing strings are the reporter's own name and e-mail, read from the
 * `help_message_name` / `help_message_email` inputs of the report form — the guest-reporting flow
 * fills them, the in-client one sends empty strings. This port was missing both fields entirely,
 * which is why the composer stayed unregistered until now.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2542/_SafeCls_2540.as
 * (obfuscated in the primary dump; `_composers[732] = _SafeCls_2540` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/help/CallForHelpMessageComposer.as).
 */
export class CallForHelpMessageComposer extends MessageComposer<unknown[]>
{
    // AS3: _SafeCls_2540.as::_SafeStr_4642
    private _data: unknown[];

    // AS3: _SafeCls_2540.as::CallForHelpMessageComposer()
    constructor(
        message: string,
        topicId: number,
        reportedUserId: number,
        roomId: number,
        chatEntries: Array<number | string>,
        reporterName: string,
        reporterEmail: string
    )
    {
        super();

        this._data = [message, topicId, reportedUserId, roomId, chatEntries.length / 2];

        for(const entry of chatEntries)
        {
            this._data.push(entry);
        }

        this._data.push(reporterName);
        this._data.push(reporterEmail);
    }

    // AS3: _SafeCls_2540.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
