import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ChestStorage} from './ChestStorage';

/**
 * One chunk of a chest's contents, header 2323.
 *
 * **A full chest arrives in pieces.** `totalFragments` and `fragmentNo` are how the receiver knows
 * when it has them all — a chest can hold more items than one message can carry, so the sub-
 * controller accumulates until the last fragment lands.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and vortex-emulator has
 * no constant for 2323. Named for the AS3 handler it feeds, `FurniChestSubController::onItemsChunk()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/_SafeCls_4449.as
 */
export class WiredChestItemsChunkMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4449.as::chestId
    private _chestId: number = 0;

    // AS3: _SafeCls_4449.as::totalFragments
    private _totalFragments: number = 0;

    // AS3: _SafeCls_4449.as::fragmentNo
    private _fragmentNo: number = 0;

    // AS3: _SafeCls_4449.as::storageChunk
    private _storageChunk: ChestStorage[] = [];

    // AS3: _SafeCls_4449.as::get chestId()
    get chestId(): number
    {
        return this._chestId;
    }

    // AS3: _SafeCls_4449.as::get totalFragments()
    get totalFragments(): number
    {
        return this._totalFragments;
    }

    // AS3: _SafeCls_4449.as::get fragmentNo()
    get fragmentNo(): number
    {
        return this._fragmentNo;
    }

    // AS3: _SafeCls_4449.as::get storageChunk()
    get storageChunk(): ChestStorage[]
    {
        return this._storageChunk;
    }

    /**
	 * AS3 flushes the vector to **null**, not to an empty one. The port uses an empty array so
	 * consumers need no null check; the distinction is invisible because `parse()` always replaces
	 * it before anyone reads.
	 */
    // AS3: _SafeCls_4449.as::flush()
    flush(): boolean
    {
        this._chestId = 0;
        this._totalFragments = 0;
        this._fragmentNo = 0;
        this._storageChunk = [];

        return true;
    }

    // AS3: _SafeCls_4449.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chestId = wrapper.readInt();
        this._totalFragments = wrapper.readInt();
        this._fragmentNo = wrapper.readInt();
        this._storageChunk = [];

        const count: number = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._storageChunk.push(new ChestStorage(wrapper));
        }

        return true;
    }
}
