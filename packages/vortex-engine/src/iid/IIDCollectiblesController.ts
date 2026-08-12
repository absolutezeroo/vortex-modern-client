import {createIID} from '@core/runtime/IID';
import type {ICollectorHub} from '@habbo/catalog/collectibles/ICollectorHub';

/**
 * IID for the Collectibles Controller.
 *
 * Typed as `ICollectorHub` — the interface `CollectiblesController` implements and the only one
 * anything outside `habbo/catalog/collectibles` is allowed to see. It was `unknown` while the
 * component was unported.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/iid/IIDCollectiblesController.as
 */
export const IID_CollectiblesController = createIID<ICollectorHub>('ICollectiblesController');
