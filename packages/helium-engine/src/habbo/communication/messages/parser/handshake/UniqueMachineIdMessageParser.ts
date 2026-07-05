import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for unique machine ID request/response
 * Message ID: 3974
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/UniqueMachineIDEventParser.as
 */
export class UniqueMachineIdMessageParser implements IMessageParser
{
    private _machineId: string = '';

    get machineId(): string
    {
        return this._machineId;
    }

    flush(): boolean
    {
        this._machineId = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper.bytesAvailable >= 2)
        {
            this._machineId = wrapper.readString();
        }
        return true;
    }
}
