/**
 * Fired on the widget event bus to override the extra purchase parameter (e.g. wallpaper variant).
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/SetExtraPurchaseParameterEvent.as
 */
export class SetExtraPurchaseParameterEvent
{
    static readonly CWE_SET_EXTRA_PARM: string = 'CWE_SET_EXTRA_PARM';

    private _parameter: string;

    constructor(parameter: string)
    {
        this._parameter = parameter;
    }

    get type(): string
    {
        return SetExtraPurchaseParameterEvent.CWE_SET_EXTRA_PARM;
    }

    get parameter(): string
    {
        return this._parameter;
    }
}
