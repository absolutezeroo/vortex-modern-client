import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests a specific badge be granted (used by the landing view's
 * `requestBadge()`, e.g. reward badges from widget content elements).
 * Registered in HabboMessages.ts with header id 2276, matching
 * sources/win63_version.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/badges/RequestABadgeComposer.as
 */
export class RequestABadgeComposer extends MessageComposer<ConstructorParameters<typeof RequestABadgeComposer>>
{
    private _data: ConstructorParameters<typeof RequestABadgeComposer>;

    constructor(badgeCode: string)
    {
        super();
        this._data = [badgeCode];
    }

    getMessageArray(): [string]
    {
        return this._data;
    }
}
