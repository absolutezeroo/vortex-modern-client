import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {TreasureHuntWinnerInfo} from './TreasureHuntWinnerInfo';

/**
 * Hotel-wide push: somebody finished this hunt first.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/campaign/treasurehunt/TreasureHuntFirstWinnerMessageEventParser.as
 */
export class TreasureHuntFirstWinnerMessageEventParser implements IMessageParser
{
    private _winnerInfo: TreasureHuntWinnerInfo | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_2655.as::get winnerInfo()
    get winnerInfo(): TreasureHuntWinnerInfo | null
    {
        return this._winnerInfo;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_2655.as::flush()
    flush(): boolean
    {
        this._winnerInfo = null;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2656/_SafeCls_2655.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._winnerInfo = new TreasureHuntWinnerInfo(wrapper);

        return true;
    }
}
