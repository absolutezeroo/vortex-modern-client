import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * How much silver each side has put towards the trade's fee.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradeSilverSetMessageEventParser.as
 * (obfuscated as `_SafeCls_2855` in the primary tree)
 */
export class TradeSilverSetMessageEventParser implements IMessageParser
{
    private _playerSilver: number = -1;

    // AS3: .../TradeSilverSetMessageEventParser.as::get playerSilver()
    get playerSilver(): number
    {
        return this._playerSilver;
    }

    private _otherPlayerSilver: number = -1;

    // AS3: .../TradeSilverSetMessageEventParser.as::get otherPlayerSilver()
    get otherPlayerSilver(): number
    {
        return this._otherPlayerSilver;
    }

    // AS3: .../TradeSilverSetMessageEventParser.as::flush()
    // AS3 resets both to -1, not 0 — "no answer yet" is distinguishable from "none staked".
    flush(): boolean
    {
        this._playerSilver = -1;
        this._otherPlayerSilver = -1;

        return true;
    }

    // AS3: .../TradeSilverSetMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._playerSilver = wrapper.readInt();
        this._otherPlayerSilver = wrapper.readInt();

        return true;
    }
}
