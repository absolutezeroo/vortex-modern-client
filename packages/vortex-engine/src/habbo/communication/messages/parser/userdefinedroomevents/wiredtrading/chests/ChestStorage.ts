import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import {FurnitureDataParser} from '@habbo/communication/messages/parser/room/engine/FurnitureDataParser';
import type {IChestStorageItem} from './IChestStorageItem';

/**
 * One item sitting in a wired chest.
 *
 * **The last field is conditional on the item's own placement**: a floor item carries a trailing
 * `extra` integer and a wall item does not. Reading it unconditionally would consume the next
 * item's `inventoryId` — and these arrive in chunks of many, so one wrong read corrupts the whole
 * remainder.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3188/ChestStorage.as
 * (the class and every accessor kept their real names)
 */
export class ChestStorage implements IChestStorageItem
{
    /**
	 * The four lock states. **Names derived** — all four identifiers are obfuscated and nothing
	 * compares against them by name, so only the values are evidence.
	 */
    // AS3: ChestStorage.as::_SafeStr_10876 (name derived)
    static readonly LOCK_STATE_0: number = 0;
    // AS3: ChestStorage.as::_SafeStr_10614 (name derived)
    static readonly LOCK_STATE_1: number = 1;
    // AS3: ChestStorage.as::_SafeStr_10521 (name derived)
    static readonly LOCK_STATE_2: number = 2;
    // AS3: ChestStorage.as::_SafeStr_10806 (name derived)
    static readonly LOCK_STATE_3: number = 3;

    // AS3: ChestStorage.as::inventoryId
    private _inventoryId: number = 0;
    // AS3: ChestStorage.as::lockState
    private _lockState: number = 0;
    // AS3: ChestStorage.as::transactionId
    private _transactionId: number = 0;
    // AS3: ChestStorage.as::type
    private _type: ChestItemType;
    // AS3: ChestStorage.as::groupable
    private _groupable: boolean = false;
    // AS3: ChestStorage.as::specialType
    private _specialType: number = 0;
    // AS3: ChestStorage.as::stuffData
    private _stuffData: IStuffData | null = null;
    // AS3: ChestStorage.as::extra
    private _extra: number = 0;

    // AS3: ChestStorage.as::ChestStorage()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._inventoryId = wrapper.readInt();
        this._lockState = wrapper.readInt();
        // A long, unlike every other numeric field here.
        this._transactionId = wrapper.readLong();
        this._type = ChestItemType.readFromMessage(wrapper);
        this._groupable = wrapper.readBoolean();
        this._specialType = wrapper.readInt();
        this._stuffData = FurnitureDataParser.parseStuffData(wrapper);

        // See the class note — floor items only.
        if(!this._type.isWallItem)
        {
            this._extra = wrapper.readInt();
        }
    }

    // AS3: ChestStorage.as::get inventoryId()
    get inventoryId(): number
    {
        return this._inventoryId;
    }

    // AS3: ChestStorage.as::get lockState()
    get lockState(): number
    {
        return this._lockState;
    }

    // AS3: ChestStorage.as::get transactionId()
    get transactionId(): number
    {
        return this._transactionId;
    }

    // AS3: ChestStorage.as::get type()
    get type(): ChestItemType
    {
        return this._type;
    }

    // AS3: ChestStorage.as::get groupable()
    get groupable(): boolean
    {
        return this._groupable;
    }

    // AS3: ChestStorage.as::get specialType()
    get specialType(): number
    {
        return this._specialType;
    }

    // AS3: ChestStorage.as::get stuffData()
    get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }

    /**
	 * Zero for a wall item — not because the chest holds none, but because the wire never sent one.
	 */
    // AS3: ChestStorage.as::get extra()
    get extra(): number
    {
        return this._extra;
    }
}
