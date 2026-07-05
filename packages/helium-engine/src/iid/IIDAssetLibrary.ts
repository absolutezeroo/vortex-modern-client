import {createIID} from "@core/runtime/IID";
import type {IAssetLibrary} from '@core/assets';

/**
 * IID for Asset Library
 *
 * Based on AS3: com.sulake.iid.IIDAssetLibrary
 */
export const IID_AssetLibrary = createIID<IAssetLibrary>('IAssetLibrary');
