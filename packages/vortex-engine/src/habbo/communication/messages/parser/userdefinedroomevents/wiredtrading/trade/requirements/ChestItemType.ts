import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * ChestItemType — a chest item-type descriptor for wired trading requirements: a wall-item flag, a
 * furni type id, and an optional legacy poster id. Read from / written to the wire.
 *
 * Placement derived: AS3 lives in the obfuscated package `_SafePkg_3188` (src/unknowns); co-located
 * with TradeRequirementNode, the only wired-setup consumer of this trade-data model.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3188/ChestItemType.as
 */
export class ChestItemType
{
    // AS3: ChestItemType.as::_SafeStr_8112 (name derived from getter isWallItem)
    private readonly _isWallItem: boolean;

    // AS3: ChestItemType.as::_SafeStr_8605 (name derived from getter typeId)
    private readonly _typeId: number;

    // AS3: ChestItemType.as::_SafeStr_8556 (name derived from getter legacyPosterId)
    private readonly _legacyPosterId: string | null;

    // AS3: ChestItemType.as::ChestItemType()
    constructor(isWallItem: boolean, typeId: number, legacyPosterId: string | null)
    {
        this._isWallItem = isWallItem;
        this._typeId = typeId;
        this._legacyPosterId = legacyPosterId;
    }

    // AS3: ChestItemType.as::readFromMessage()
    static readFromMessage(wrapper: IMessageDataWrapper): ChestItemType
    {
        const isWallItem = wrapper.readBoolean();
        const typeId = wrapper.readInt();
        const legacyPosterId = wrapper.readString();
        return new ChestItemType(isWallItem, typeId, legacyPosterId === '' ? null : legacyPosterId);
    }

    // AS3: ChestItemType.as::get isWallItem()
    get isWallItem(): boolean
    {
        return this._isWallItem;
    }

    // AS3: ChestItemType.as::get typeId()
    get typeId(): number
    {
        return this._typeId;
    }

    // AS3: ChestItemType.as::get legacyPosterId()
    get legacyPosterId(): string
    {
        return this._legacyPosterId === null ? '' : this._legacyPosterId;
    }

    // AS3: ChestItemType.as::addToComposer()
    addToComposer(array: unknown[]): void
    {
        array.push(this._isWallItem);
        array.push(this._typeId);
        array.push(this.legacyPosterId);
    }
}
