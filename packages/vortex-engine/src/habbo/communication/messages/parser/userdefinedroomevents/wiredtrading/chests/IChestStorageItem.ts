import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';

/**
 * The three things a renderer needs from anything that can sit in a chest — the type, the special
 * type, and the stuff data.
 *
 * Implemented both by {@link ChestStorage} (an item actually in a chest) and by the transaction
 * views' own wrapper, which is why it exists at all rather than the renderers taking `ChestStorage`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3188/_SafeCls_4229.as
 * (name derived: obfuscated in every tree, named for what it describes)
 */
export interface IChestStorageItem
{
    // AS3: _SafeCls_4229.as::get type()
    readonly type: ChestItemType;

    // AS3: _SafeCls_4229.as::get specialType()
    readonly specialType: number;

    // AS3: _SafeCls_4229.as::get stuffData()
    readonly stuffData: IStuffData | null;
}
