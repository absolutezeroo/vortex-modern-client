import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reports a private conversation (header 838). Same shape as the general call for help minus the
 * room id — an IM has no room.
 *
 * The two trailing strings are the reporter's own name and e-mail, read from the
 * `help_message_name` / `help_message_email` inputs of the report form — the guest-reporting flow
 * fills them, the in-client one sends empty strings. This port was missing both fields entirely,
 * which is why the composer stayed unregistered until now.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2542/_SafeCls_3732.as
 * (obfuscated in the primary dump; `_composers[838] = _SafeCls_3732` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/help/CallForHelpFromIMMessageComposer.as).
 */
export class CallForHelpFromIMMessageComposer extends MessageComposer<unknown[]>
{
    // AS3: _SafeCls_3732.as::_SafeStr_4642
    private _data: unknown[];

    // AS3: _SafeCls_3732.as::CallForHelpFromIMMessageComposer()
    constructor(
        message: string,
        topicId: number,
        reportedUserId: number,
        chatEntries: string[],
        reporterName: string,
        reporterEmail: string
    )
    {
        super();

        this._data = [message, topicId, reportedUserId, chatEntries.length / 2];

        for(const entry of chatEntries)
        {
            this._data.push(entry);
        }

        this._data.push(reporterName);
        this._data.push(reporterEmail);
    }

    // AS3: _SafeCls_3732.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
