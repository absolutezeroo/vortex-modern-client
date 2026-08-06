/**
 * Drives the purchase-quantity spinner shown for bundle offers.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as
 */
export class CatalogWidgetSpinnerEvent
{
    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as::VALUE_CHANGED
    static readonly VALUE_CHANGED: string = 'CWSE_VALUE_CHANGED';

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as::RESET
    static readonly RESET: string = 'CWSE_RESET';

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as::SHOW
    static readonly SHOW: string = 'CWSE_SHOW';

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as::HIDE
    static readonly HIDE: string = 'CWSE_HIDE';

    static readonly SET_MAX: string = 'CWSE_SET_MAX';

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as::SET_MIN
    static readonly SET_MIN: string = 'CWSE_SET_MIN';

    private _type: string;

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as::_value
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

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as::get value()
    get value(): number
    {
        return this._value;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/events/CatalogWidgetSpinnerEvent.as::get skipSteps()
    get skipSteps(): number[] | null
    {
        return this._skipSteps;
    }
}
