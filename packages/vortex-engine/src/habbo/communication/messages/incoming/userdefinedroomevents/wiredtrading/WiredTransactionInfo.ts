import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One row of a wired-chest transaction log: who moved what, in or out, and when.
 *
 * Read in the constructor, as AS3 does — the enclosing {@link WiredTransactionLogList} builds these
 * straight off the same buffer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2640/WiredTransactionInfo.as
 * (the class kept its real name; so did every accessor below, which is why nothing here is derived)
 */
export class WiredTransactionInfo
{
    /**
	 * The five transaction-type codes AS3 declares as statics. Their identifiers are obfuscated in
	 * every tree and nothing compares against them by name — `TransactionPreviewTableObject` builds
	 * a localization key out of the raw number instead (`transaction.type.<n>`), so the values are
	 * what matter and the names below are **derived from that ordering**, not recovered.
	 */
    // AS3: WiredTransactionInfo.as::_SafeStr_11284 (name derived)
    static readonly TYPE_UNKNOWN: number = 0;
    // AS3: WiredTransactionInfo.as::_SafeStr_10474 (name derived)
    static readonly TYPE_1: number = 1;
    // AS3: WiredTransactionInfo.as::_SafeStr_11675 (name derived)
    static readonly TYPE_2: number = 2;
    // AS3: WiredTransactionInfo.as::_SafeStr_11681 (name derived)
    static readonly TYPE_3: number = 3;
    // AS3: WiredTransactionInfo.as::_SafeStr_10962 (name derived)
    static readonly TYPE_4: number = 4;

    // AS3: WiredTransactionInfo.as::transactionId
    private _transactionId: number = 0;
    // AS3: WiredTransactionInfo.as::_flatId
    private _flatId: number = 0;
    // AS3: WiredTransactionInfo.as::transactionType
    private _transactionType: number = 0;
    // AS3: WiredTransactionInfo.as::transactionDefinitionInfo
    private _transactionDefinitionInfo: string = '';
    // AS3: WiredTransactionInfo.as::userId
    private _userId: number = 0;
    // AS3: WiredTransactionInfo.as::_userName
    private _userName: string = '';
    // AS3: WiredTransactionInfo.as::timestamp
    private _timestamp: number = 0;
    // AS3: WiredTransactionInfo.as::readableTimestamp
    private _readableTimestamp: string = '';
    // AS3: WiredTransactionInfo.as::chestCount
    private _chestCount: number = 0;
    // AS3: WiredTransactionInfo.as::withdrawFurniCount
    private _withdrawFurniCount: number = 0;
    // AS3: WiredTransactionInfo.as::depositFurniCount
    private _depositFurniCount: number = 0;
    // AS3: WiredTransactionInfo.as::withdrawCoinsCount
    private _withdrawCoinsCount: number = 0;
    // AS3: WiredTransactionInfo.as::depositCoinsCount
    private _depositCoinsCount: number = 0;

    // AS3: WiredTransactionInfo.as::WiredTransactionInfo()
    constructor(wrapper: IMessageDataWrapper)
    {
        // Two longs in here — the id and the timestamp — with everything else int or string. The
        // order is the whole contract; a single swapped read desynchronises the rest of the list.
        this._transactionId = wrapper.readLong();
        this._flatId = wrapper.readInt();
        this._transactionType = wrapper.readInt();
        this._transactionDefinitionInfo = wrapper.readString();
        this._userId = wrapper.readInt();
        this._userName = wrapper.readString();
        this._timestamp = wrapper.readLong();
        this._readableTimestamp = wrapper.readString();
        this._chestCount = wrapper.readInt();
        this._withdrawFurniCount = wrapper.readInt();
        this._depositFurniCount = wrapper.readInt();
        this._withdrawCoinsCount = wrapper.readInt();
        this._depositCoinsCount = wrapper.readInt();
    }

    // AS3: WiredTransactionInfo.as::get transactionId()
    get transactionId(): number
    {
        return this._transactionId;
    }

    // AS3: WiredTransactionInfo.as::get flatId()
    get flatId(): number
    {
        return this._flatId;
    }

    // AS3: WiredTransactionInfo.as::get transactionType()
    get transactionType(): number
    {
        return this._transactionType;
    }

    // AS3: WiredTransactionInfo.as::get transactionDefinitionInfo()
    get transactionDefinitionInfo(): string
    {
        return this._transactionDefinitionInfo;
    }

    // AS3: WiredTransactionInfo.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: WiredTransactionInfo.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: WiredTransactionInfo.as::get timestamp()
    get timestamp(): number
    {
        return this._timestamp;
    }

    // AS3: WiredTransactionInfo.as::get readableTimestamp()
    get readableTimestamp(): string
    {
        return this._readableTimestamp;
    }

    // AS3: WiredTransactionInfo.as::get chestCount()
    get chestCount(): number
    {
        return this._chestCount;
    }

    // AS3: WiredTransactionInfo.as::get withdrawFurniCount()
    get withdrawFurniCount(): number
    {
        return this._withdrawFurniCount;
    }

    // AS3: WiredTransactionInfo.as::get depositFurniCount()
    get depositFurniCount(): number
    {
        return this._depositFurniCount;
    }

    // AS3: WiredTransactionInfo.as::get withdrawCoinsCount()
    get withdrawCoinsCount(): number
    {
        return this._withdrawCoinsCount;
    }

    // AS3: WiredTransactionInfo.as::get depositCoinsCount()
    get depositCoinsCount(): number
    {
        return this._depositCoinsCount;
    }
}
