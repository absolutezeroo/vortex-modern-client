import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/users/GetGuildCreationInfoMessageComposer.as
 */
export class GetGuildCreationInfoMessageComposer extends MessageComposer<[]>
{
    private _data: [] = [];

    getMessageArray()
    {
        return this._data;
    }
}
