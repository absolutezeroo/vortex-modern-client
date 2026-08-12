import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The player's collector standing: current score, personal best, and the level those buy.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`CollectionsTab.as::onCollectionsScoreMessage()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4027.as
 */
export class NftCollectionsScoreMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4027.as::_SafeStr_5404 (from `get score()`)
    private _score: number = 0;

    // AS3: _SafeCls_4027.as::_SafeStr_9801 (from `get highestScore()`)
    private _highestScore: number = 0;

    // AS3: _SafeCls_4027.as::_SafeStr_6012 (from `get level()`)
    private _level: number = 0;

    // AS3: _SafeCls_4027.as::flush()
    flush(): boolean
    {
        this._score = 0;
        this._highestScore = 0;
        this._level = 0;

        return true;
    }

    // AS3: _SafeCls_4027.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._score = wrapper.readInt();
        this._highestScore = wrapper.readInt();
        this._level = wrapper.readInt();

        return true;
    }

    // AS3: _SafeCls_4027.as::get score()
    get score(): number
    {
        return this._score;
    }

    // AS3: _SafeCls_4027.as::get highestScore()
    get highestScore(): number
    {
        return this._highestScore;
    }

    // AS3: _SafeCls_4027.as::get level()
    get level(): number
    {
        return this._level;
    }
}
