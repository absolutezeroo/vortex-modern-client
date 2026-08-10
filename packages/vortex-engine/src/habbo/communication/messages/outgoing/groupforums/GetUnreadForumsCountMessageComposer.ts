import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask how many of the user's forums have unread posts. No payload.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/GetUnreadForumsCountMessageComposer.as
 * (`_SafeCls_3100` in the primary tree; header 1076 from its registry)
 */
export class GetUnreadForumsCountMessageComposer extends MessageComposer<[]>
{
    private _data: [] = [];

    // AS3: .../groupforums/GetUnreadForumsCountMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
