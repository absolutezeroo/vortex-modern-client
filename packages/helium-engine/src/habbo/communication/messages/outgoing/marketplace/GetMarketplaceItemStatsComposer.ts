import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1746/_SafeCls_2146.as
 * (real name recovered from sources/win63_version/habbo/communication/messages/outgoing/marketplace/GetMarketplaceItemStatsComposer.as)
 */
export class GetMarketplaceItemStatsComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    // AS3: sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1746/_SafeCls_2146.as::_SafeCls_2146()
    // extraData is only pushed when non-null and non-empty, matching AS3 exactly.
    constructor(category: number, furniId: number, extraData: string | null = null)
    {
        super();
        this._data = [category, furniId];

        if(extraData !== null && extraData.length > 0)
        {
            this._data.push(extraData);
        }
    }

    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
