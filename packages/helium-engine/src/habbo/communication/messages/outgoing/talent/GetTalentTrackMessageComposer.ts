import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests talent track data for the given track name.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/talent/GetTalentTrackMessageComposer.as
 */
export class GetTalentTrackMessageComposer extends MessageComposer<ConstructorParameters<typeof GetTalentTrackMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetTalentTrackMessageComposer>;

    constructor(trackName: string)
    {
        super();
        this._data = [trackName];
    }

    getMessageArray(): [string]
    {
        return this._data;
    }
}
