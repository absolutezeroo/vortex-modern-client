/**
 * Everything the warning window needs about the person you are trading with, taken once when the
 * trade opens so the window does not have to reach back into the room session.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/namescam/TradingNameScamWarningData.as
 */
export class TradingNameScamWarningData
{
    // AS3: .../TradingNameScamWarningData.as::_tradedUserId
    private _tradedUserId: number;

    // AS3: .../TradingNameScamWarningData.as::_tradedUserName
    private _tradedUserName: string;

    // AS3: .../TradingNameScamWarningData.as::_tradedUserFigure
    private _tradedUserFigure: string;

    // AS3: .../TradingNameScamWarningData.as::_similarInRoom
    private _similarInRoom: string[];

    // AS3: .../TradingNameScamWarningData.as::_similarInFriends
    private _similarInFriends: string[];

    // AS3: .../TradingNameScamWarningData.as::TradingNameScamWarningData()
    constructor(
        tradedUserId: number,
        tradedUserName: string | null,
        tradedUserFigure: string | null,
        similarInRoom: string[] | null,
        similarInFriends: string[] | null
    )
    {
        this._tradedUserId = tradedUserId;
        this._tradedUserName = tradedUserName ?? '';
        this._tradedUserFigure = tradedUserFigure ?? '';
        this._similarInRoom = similarInRoom !== null ? [...similarInRoom] : [];
        this._similarInFriends = similarInFriends !== null ? [...similarInFriends] : [];
    }

    // AS3: .../TradingNameScamWarningData.as::get tradedUserId()
    get tradedUserId(): number
    {
        return this._tradedUserId;
    }

    // AS3: .../TradingNameScamWarningData.as::get tradedUserName()
    get tradedUserName(): string
    {
        return this._tradedUserName;
    }

    // AS3: .../TradingNameScamWarningData.as::get tradedUserFigure()
    get tradedUserFigure(): string
    {
        return this._tradedUserFigure;
    }

    // AS3: .../TradingNameScamWarningData.as::get similarInRoom()
    get similarInRoom(): string[]
    {
        return [...this._similarInRoom];
    }

    // AS3: .../TradingNameScamWarningData.as::get similarInFriends()
    get similarInFriends(): string[]
    {
        return [...this._similarInFriends];
    }
}
