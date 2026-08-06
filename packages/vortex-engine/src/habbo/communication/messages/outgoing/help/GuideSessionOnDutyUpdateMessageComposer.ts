import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Updates the guide's on-duty status for various duty types.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GuideSessionOnDutyUpdateMessageComposer.as
 */
export class GuideSessionOnDutyUpdateMessageComposer extends MessageComposer<ConstructorParameters<typeof GuideSessionOnDutyUpdateMessageComposer>>
{
    private _data: ConstructorParameters<typeof GuideSessionOnDutyUpdateMessageComposer>;

    constructor(onDuty: boolean, guideDuty: boolean, helpDuty: boolean, bullyDuty: boolean)
    {
        super();
        this._data = [onDuty, guideDuty, helpDuty, bullyDuty];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/help/GuideSessionOnDutyUpdateMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
