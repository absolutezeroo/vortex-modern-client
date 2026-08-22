import type {IThumbListDrawableItem} from '../IThumbListDrawableItem';

/**
 * What a `ThumbListManager` asks for the items it draws.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/common/IThumbListDataProvider.as
 */
export interface IThumbListDataProvider
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/common/IThumbListDataProvider.as::getDrawableList()
    getDrawableList(): IThumbListDrawableItem[];

    // TS-only: AS3's interface declares only `getDrawableList()`; `EffectsView` disposes the
    // proxies it was handed, so the contract says so rather than casting at the call site.
    dispose(): void;
}
