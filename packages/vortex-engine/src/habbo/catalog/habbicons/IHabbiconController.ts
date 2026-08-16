import type {IUnknown} from '@core/runtime/IUnknown';

import type {
    OwnedHabbiconData
} from '@habbo/communication/messages/incoming/habbicons/OwnedHabbiconData';
import type {
    HabbiconShopItemData
} from '@habbo/communication/messages/incoming/habbicons/HabbiconShopItemData';
import type {
    HabbiconCollectionData
} from '@habbo/communication/messages/incoming/habbicons/HabbiconCollectionData';

import type {HabbiconControllerEvent} from './HabbiconControllerEvent';

/**
 * What the habbicon views are allowed to see of their controller.
 *
 * **The interface name is DERIVED** — the dump calls it `_SafeCls_1815` and no unobfuscated tree
 * carries it, habbicons postdating them all. Named for its only implementor,
 * `HabbiconController`, in line with every other `I<Class>` in this port. Its *members* are all
 * real: obfuscation leaves method names alone.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/_SafeCls_1815.as
 */
export interface IHabbiconController extends IUnknown
{
    // AS3: _SafeCls_1815.as::get hasLoadedShopData()
    readonly hasLoadedShopData: boolean;

    // AS3: _SafeCls_1815.as::get ownedHabbicons()
    readonly ownedHabbicons: OwnedHabbiconData[];

    // AS3: _SafeCls_1815.as::get recentHabbiconIds()
    readonly recentHabbiconIds: number[];

    // AS3: _SafeCls_1815.as::get shopCollections()
    readonly shopCollections: HabbiconCollectionData[];

    // AS3: _SafeCls_1815.as::get unseenHabbiconCount()
    readonly unseenHabbiconCount: number;

    // AS3: _SafeCls_1815.as::addEventListener()
    addEventListener(type: string, listener: (event: HabbiconControllerEvent) => void): void;

    // AS3: _SafeCls_1815.as::removeEventListener()
    removeEventListener(type: string, listener: (event: HabbiconControllerEvent) => void): void;

    // AS3: _SafeCls_1815.as::openHabbiconHub()
    openHabbiconHub(): void;

    // AS3: _SafeCls_1815.as::getShopData()
    getShopData(force?: boolean): void;

    // AS3: _SafeCls_1815.as::getHabbiconInfo()
    getHabbiconInfo(habbiconId: number): void;

    // AS3: _SafeCls_1815.as::noteHabbiconUsed()
    noteHabbiconUsed(habbiconId: number): void;

    // AS3: _SafeCls_1815.as::isUnseenHabbicon()
    isUnseenHabbicon(habbiconId: number): boolean;

    // AS3: _SafeCls_1815.as::removeUnseenHabbicon()
    removeUnseenHabbicon(habbiconId: number): void;

    // AS3: _SafeCls_1815.as::resetUnseenHabbicons()
    resetUnseenHabbicons(): void;

    // AS3: _SafeCls_1815.as::buyHabbicon()
    buyHabbicon(habbiconId: number): void;

    // AS3: _SafeCls_1815.as::buyHabbiconCollection()
    buyHabbiconCollection(collectionId: number): void;

    // AS3: _SafeCls_1815.as::claimHabbicon()
    claimHabbicon(habbiconId: number): void;

    // AS3: _SafeCls_1815.as::favoriteHabbicon()
    favoriteHabbicon(habbiconId: number): void;

    // AS3: _SafeCls_1815.as::unfavoriteHabbicon()
    unfavoriteHabbicon(habbiconId: number): void;

    // AS3: _SafeCls_1815.as::tryGetOwnedHabbicon()
    tryGetOwnedHabbicon(habbiconId: number): OwnedHabbiconData | null;

    // AS3: _SafeCls_1815.as::tryGetShopItem()
    tryGetShopItem(habbiconId: number): HabbiconShopItemData | null;
}
