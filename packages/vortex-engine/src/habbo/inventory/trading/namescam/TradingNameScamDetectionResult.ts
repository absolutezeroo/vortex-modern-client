/**
 * What the name-scam check found: the room names and the friend names that look like the name of
 * the person you are trading with.
 *
 * Both lists are copied in and copied out, as in AS3 — a caller cannot mutate the result.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/namescam/TradingNameScamDetectionResult.as
 */
export class TradingNameScamDetectionResult
{
    // AS3: .../TradingNameScamDetectionResult.as::NO_MATCHES
    static readonly NO_MATCHES: TradingNameScamDetectionResult = new TradingNameScamDetectionResult(null, null);

    // AS3: .../TradingNameScamDetectionResult.as::_similarInRoom
    private _similarInRoom: string[];

    // AS3: .../TradingNameScamDetectionResult.as::_similarInFriends
    private _similarInFriends: string[];

    // AS3: .../TradingNameScamDetectionResult.as::TradingNameScamDetectionResult()
    constructor(similarInRoom: string[] | null, similarInFriends: string[] | null)
    {
        this._similarInRoom = similarInRoom !== null ? [...similarInRoom] : [];
        this._similarInFriends = similarInFriends !== null ? [...similarInFriends] : [];
    }

    // AS3: .../TradingNameScamDetectionResult.as::get nameScamDetected()
    get nameScamDetected(): boolean
    {
        return this._similarInRoom.length > 0 || this._similarInFriends.length > 0;
    }

    // AS3: .../TradingNameScamDetectionResult.as::get similarInRoom()
    get similarInRoom(): string[]
    {
        return [...this._similarInRoom];
    }

    // AS3: .../TradingNameScamDetectionResult.as::get similarInFriends()
    get similarInFriends(): string[]
    {
        return [...this._similarInFriends];
    }
}
