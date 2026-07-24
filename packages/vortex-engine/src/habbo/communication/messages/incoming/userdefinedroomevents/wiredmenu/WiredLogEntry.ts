import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * WiredLogEntry — a single row in the wired room-logs table: its id, level and source codes, the log
 * message, and a raw + pre-formatted timestamp. Constructed inline from the message stream; the field
 * read order below is authoritative for the wire format.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4026/WiredLogEntry.as
 */
export class WiredLogEntry
{
    // AS3: WiredLogEntry.as::_SafeStr_4872 (name derived: id)
    private _id: number;

    // AS3: WiredLogEntry.as::_SafeStr_9827 (name derived: log level)
    private _logLevel: number;

    // AS3: WiredLogEntry.as::_SafeStr_9440 (name derived: log source)
    private _logSource: number;

    // AS3: WiredLogEntry.as::_SafeStr_9899 (name derived: log message)
    private _logMessage: string;

    // AS3: WiredLogEntry.as::_SafeStr_7929 (name derived: timestamp)
    private _timestamp: number;

    // AS3: WiredLogEntry.as::_SafeStr_9915 (name derived: formatted timestamp)
    private _timestampStr: string;

    // AS3: WiredLogEntry.as::WiredLogEntry()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readLong();
        this._logLevel = wrapper.readByte();
        this._logSource = wrapper.readByte();
        this._logMessage = wrapper.readString();
        this._timestamp = wrapper.readLong();
        this._timestampStr = wrapper.readString();
    }

    // AS3: WiredLogEntry.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: WiredLogEntry.as::get logLevel()
    get logLevel(): number
    {
        return this._logLevel;
    }

    // AS3: WiredLogEntry.as::get logSource()
    get logSource(): number
    {
        return this._logSource;
    }

    // AS3: WiredLogEntry.as::get logMessage()
    get logMessage(): string
    {
        return this._logMessage;
    }

    // AS3: WiredLogEntry.as::get timestamp()
    get timestamp(): number
    {
        return this._timestamp;
    }

    // AS3: WiredLogEntry.as::get timestampStr()
    get timestampStr(): string
    {
        return this._timestampStr;
    }
}
