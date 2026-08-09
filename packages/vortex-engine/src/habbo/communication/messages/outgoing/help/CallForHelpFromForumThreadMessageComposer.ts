import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reports a whole forum thread (header 380).
 *
 * The two trailing strings are the reporter's own name and e-mail, read from the
 * `help_message_name` / `help_message_email` inputs of the report form — the guest-reporting flow
 * fills them, the in-client one sends empty strings. This port was missing both fields entirely,
 * which is why the composer stayed unregistered until now.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2542/_SafeCls_3708.as
 * (obfuscated in the primary dump; `_composers[380] = _SafeCls_3708` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/help/CallForHelpFromForumThreadMessageComposer.as).
 */
export class CallForHelpFromForumThreadMessageComposer extends MessageComposer<unknown[]>
{
    // AS3: _SafeCls_3708.as::_SafeStr_4642
    private _data: unknown[];

    // AS3: _SafeCls_3708.as::CallForHelpFromForumThreadMessageComposer()
    constructor(
        groupId: number,
        threadId: number,
        topicId: number,
        message: string,
        reporterName: string,
        reporterEmail: string
    )
    {
        super();

        this._data = [groupId, threadId, topicId, message, reporterName, reporterEmail];
    }

    // AS3: _SafeCls_3708.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
