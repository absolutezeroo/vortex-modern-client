import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Change user motto
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/avatar/ChangeMottoMessageComposer.as
 */
export class ChangeMottoMessageComposer extends MessageComposer<ConstructorParameters<typeof ChangeMottoMessageComposer>>
{
    private _data: ConstructorParameters<typeof ChangeMottoMessageComposer>;

    constructor(motto: string)
    {
        super();
        this._data = [motto];
    }

    getMessageArray()
    {
        return this._data;
    }
}
