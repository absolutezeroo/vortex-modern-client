import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends feedback for a completed guide session.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GuideSessionFeedbackMessageComposer.as
 */
export class GuideSessionFeedbackMessageComposer extends MessageComposer<ConstructorParameters<typeof GuideSessionFeedbackMessageComposer>>
{
    private _data: ConstructorParameters<typeof GuideSessionFeedbackMessageComposer>;

    constructor(positive: boolean)
    {
        super();
        this._data = [positive];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/help/GuideSessionFeedbackMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
