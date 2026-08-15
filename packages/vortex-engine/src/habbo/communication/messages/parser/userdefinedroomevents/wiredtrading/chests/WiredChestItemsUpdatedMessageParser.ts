import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ChestStorage} from './ChestStorage';

/**
 * A delta on a chest's contents, header 2738 — what left and what arrived, in one message.
 *
 * Removals are **ids only**; additions are whole {@link ChestStorage} records. The two lists are
 * length-prefixed independently and read in that order, so an empty removal list still costs its
 * count.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and vortex-emulator has
 * no constant for 2738. Named for the AS3 handler it feeds,
 * `FurniChestSubController::onItemsUpdated()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/_SafeCls_4239.as
 */
export class WiredChestItemsUpdatedMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4239.as::chestId
    private _chestId: number = 0;

    // AS3: _SafeCls_4239.as::removedIds
    private _removedIds: number[] = [];

    // AS3: _SafeCls_4239.as::addedStorage
    private _addedStorage: ChestStorage[] = [];

    // AS3: _SafeCls_4239.as::get chestId()
    get chestId(): number
    {
        return this._chestId;
    }

    // AS3: _SafeCls_4239.as::get removedIds()
    get removedIds(): number[]
    {
        return this._removedIds;
    }

    // AS3: _SafeCls_4239.as::get addedStorage()
    get addedStorage(): ChestStorage[]
    {
        return this._addedStorage;
    }

    // AS3: _SafeCls_4239.as::flush()
    flush(): boolean
    {
        this._chestId = 0;
        this._removedIds = [];
        this._addedStorage = [];

        return true;
    }

    // AS3: _SafeCls_4239.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chestId = wrapper.readInt();
        this._removedIds = [];
        this._addedStorage = [];

        const removedCount: number = wrapper.readInt();

        for(let i = 0; i < removedCount; i++)
        {
            this._removedIds.push(wrapper.readInt());
        }

        const addedCount: number = wrapper.readInt();

        for(let i = 0; i < addedCount; i++)
        {
            this._addedStorage.push(new ChestStorage(wrapper));
        }

        return true;
    }
}
