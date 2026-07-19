/**
 * Event for interstitial ad state changes
 *
 * @see source_as_win63/habbo/advertisement/events/InterstitialEvent.as
 */
export class InterstitialEvent
{
    static readonly INTERSTITIAL_SHOW = 'AE_INTERSTITIAL_SHOW';
    static readonly INTERSTITIAL_NOT_SHOWN = 'AE_INTERSTITIAL_NOT_SHOWN';
    static readonly INTERSTITIAL_COMPLETE = 'AE_INTERSTITIAL_COMPLETE';

    constructor(type: string, status: string = '')
    {
        this._type = type;
        this._status = status;
    }

    private _type: string;

    get type(): string
    {
        return this._type;
    }

    private _status: string;

    get status(): string
    {
        return this._status;
    }
}
