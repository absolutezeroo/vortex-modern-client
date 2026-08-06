import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests a user name change.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/avatar/ChangeUserNameMessageComposer.as
 */
export class ChangeUserNameMessageComposer extends MessageComposer<ConstructorParameters<typeof ChangeUserNameMessageComposer>>
{
    private _data: ConstructorParameters<typeof ChangeUserNameMessageComposer>;

    constructor(name: string)
    {
        super();
        this._data = [name];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/avatar/ChangeUserNameMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
