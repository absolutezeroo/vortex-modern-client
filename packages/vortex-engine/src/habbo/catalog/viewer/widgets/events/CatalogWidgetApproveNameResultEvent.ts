/**
 * Fired on the widget event bus when the server has validated a pending pet name.
 *
 * AS3's `bubbles`/`cancelable` constructor params are dropped, matching every other ported widget
 * event in this directory (this bus is not a flash.events.EventDispatcher).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetApproveNameResultEvent.as
 */
export class CatalogWidgetApproveNameResultEvent
{
    static readonly CWE_APPROVE_RESULT: string = 'CWE_APPROVE_RESULT';

    private _result: number;

    private _nameValidationInfo: string | null;

    constructor(result: number, nameValidationInfo: string | null)
    {
        this._result = result;
        this._nameValidationInfo = nameValidationInfo;
    }

    get type(): string
    {
        return CatalogWidgetApproveNameResultEvent.CWE_APPROVE_RESULT;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetApproveNameResultEvent.as::get result()
    get result(): number
    {
        return this._result;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetApproveNameResultEvent.as::get nameValidationInfo()
    get nameValidationInfo(): string | null
    {
        return this._nameValidationInfo;
    }
}
