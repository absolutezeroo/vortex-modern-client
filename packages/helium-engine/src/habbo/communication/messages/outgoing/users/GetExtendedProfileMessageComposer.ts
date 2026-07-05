import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request an extended user profile.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer.as
 */
export class GetExtendedProfileMessageComposer extends MessageComposer<ConstructorParameters<typeof GetExtendedProfileMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetExtendedProfileMessageComposer>;

    constructor(userId: number, openWindow: boolean = true)
    {
        super();

        this._data = [userId, openWindow];
    }

    getMessageArray()
    {
        return this._data;
    }
}
