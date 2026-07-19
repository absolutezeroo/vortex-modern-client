/**
 * Drives the purchase-quantity spinner shown for bundle offers.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as
 */
export class CatalogWidgetSpinnerEvent
{
    static readonly VALUE_CHANGED: string = 'CWSE_VALUE_CHANGED';

    static readonly RESET: string = 'CWSE_RESET';

    static readonly SHOW: string = 'CWSE_SHOW';

    static readonly HIDE: string = 'CWSE_HIDE';

    static readonly SET_MAX: string = 'CWSE_SET_MAX';

    static readonly SET_MIN: string = 'CWSE_SET_MIN';

    private _type: string;

    private _value: number;

    private _skipSteps: number[] | null;

    constructor(type: string, value: number = 1, skipSteps: number[] | null = null)
    {
        this._type = type;
        this._value = value;
        this._skipSteps = skipSteps;
    }

    get type(): string
    {
        return this._type;
    }

    get value(): number
    {
        return this._value;
    }

    get skipSteps(): number[] | null
    {
        return this._skipSteps;
    }
}
