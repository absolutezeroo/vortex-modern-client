import type {IDisposable} from '@core/runtime/IDisposable';
import {Logger} from '@core/utils/Logger';
import {HabboMallOffer} from '../data/HabboMallOffer';
import type {OfferController} from '../OfferController';

const log = Logger.getLogger('habbo.catalog.targetedoffers.MallOfferExternalInterfaceHelper');

/**
 * Asks the surrounding web page whether it has a Habbo Mall offer for this player.
 *
 * Flash reached the page through `ExternalInterface`: a call out to `TargetedWebOffer.checkOffer`
 * and two named callbacks the page invokes back. The browser equivalent is the same three names on
 * `window` — the page-side contract is a set of *strings*, so they are kept exactly, and a page
 * written for the Flash client keeps working.
 *
 * The whole path is inert when the page defines no `TargetedWebOffer`, which is the normal case
 * for a standalone client, and it is only ever constructed after the server has said it has no
 * targeted offer of its own.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as
 */
export class MallOfferExternalInterfaceHelper implements IDisposable
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::GET_HABBO_SHOP_OFFER_FUNCTION
    private static readonly GET_HABBO_SHOP_OFFER_FUNCTION: string = 'TargetedWebOffer.checkOffer';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::GET_HABBO_SHOP_OFFER_FAILED_CALLBACK
    private static readonly GET_HABBO_SHOP_OFFER_FAILED_CALLBACK: string = 'targetedWebOfferCheckFailed';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::GET_HABBO_SHOP_OFFER_RESULT_CALLBACK
    private static readonly GET_HABBO_SHOP_OFFER_RESULT_CALLBACK: string = 'targetedWebOfferCheckResponse';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::_SafeStr_4593
    private _controller: OfferController | null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::MallOfferExternalInterfaceHelper()
    constructor(controller: OfferController)
    {
        this._controller = controller;

        if(typeof window === 'undefined') return;

        const host = window as unknown as Record<string, unknown>;

        host[MallOfferExternalInterfaceHelper.GET_HABBO_SHOP_OFFER_RESULT_CALLBACK] = this.onShopOfferResult;
        host[MallOfferExternalInterfaceHelper.GET_HABBO_SHOP_OFFER_FAILED_CALLBACK] = this.onShopOfferFailed;

        this.callPage();
    }

    /**
     * `ExternalInterface.call("TargetedWebOffer.checkOffer")` in AS3. Resolved by walking the
     * dotted name off `window` rather than with `eval`, and silently skipped when the page has no
     * such object — which is exactly what the Flash player did when the call had no receiver.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::MallOfferExternalInterfaceHelper()
    private callPage(): void
    {
        const path = MallOfferExternalInterfaceHelper.GET_HABBO_SHOP_OFFER_FUNCTION.split('.');

        let scope: Record<string, unknown> = window as unknown as Record<string, unknown>;
        let target: unknown = scope;

        for(const segment of path)
        {
            if(target == null || typeof target !== 'object') return;

            scope = target as Record<string, unknown>;
            target = scope[segment];
        }

        if(typeof target !== 'function') return;

        try
        {
            (target as (this: unknown) => void).call(scope);
        }
        catch (error)
        {
            log.warn('TargetedWebOffer.checkOffer threw in the host page', error);
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::onShopOfferResult()
    onShopOfferResult = (data: Record<string, unknown> | null): void =>
    {
        if(data == null) return;

        this._controller?.onHabboMallOffer(new HabboMallOffer(data));
    };

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::onShopOfferFailed()
    onShopOfferFailed = (): void =>
    {
    };

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/MallOfferExternalInterfaceHelper.as::dispose()
    dispose(): void
    {
        if(typeof window !== 'undefined')
        {
            const host = window as unknown as Record<string, unknown>;

            delete host[MallOfferExternalInterfaceHelper.GET_HABBO_SHOP_OFFER_RESULT_CALLBACK];
            delete host[MallOfferExternalInterfaceHelper.GET_HABBO_SHOP_OFFER_FAILED_CALLBACK];
        }

        this._controller = null;
    }

    // TS-only: `IDisposable` requires it; AS3's helper has no disposed flag of its own.
    get disposed(): boolean
    {
        return this._controller === null;
    }
}
