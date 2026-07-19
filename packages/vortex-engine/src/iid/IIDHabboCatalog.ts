import {createIID} from '@core/runtime/IID';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';

/**
 * IID for Habbo Catalog
 *
 * Based on AS3: com.sulake.iid.IIDHabboCatalog
 */
export const IID_HabboCatalog = createIID<IHabboCatalog>('IHabboCatalog');
