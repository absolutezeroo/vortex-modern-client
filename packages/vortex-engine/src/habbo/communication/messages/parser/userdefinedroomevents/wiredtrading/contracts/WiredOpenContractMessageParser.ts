import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * "Open the editor for this contract", header 1479. One integer.
 *
 * **Name DERIVED** — named for the AS3 handler it feeds,
 * `WiredContractController::onOpenContract()`. No unobfuscated tree carries it.
 *
 * Do not take the emulator's 1479 as corroboration: it defines
 * `Game2GetTotalGroupLeaderboardEvent = 1479` in its *client→server* table, an unrelated message.
 * The two tables are independent, so this is not a collision — but it would name this one wrong.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2588/_SafeCls_3353.as
 */
export class WiredOpenContractMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3353.as::contractId (backing field)
    private _contractId: number = 0;

    // AS3: _SafeCls_3353.as::get contractId()
    get contractId(): number
    {
        return this._contractId;
    }

    // AS3: _SafeCls_3353.as::flush()
    flush(): boolean
    {
        this._contractId = 0;

        return true;
    }

    // AS3: _SafeCls_3353.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._contractId = wrapper.readInt();

        return true;
    }
}
